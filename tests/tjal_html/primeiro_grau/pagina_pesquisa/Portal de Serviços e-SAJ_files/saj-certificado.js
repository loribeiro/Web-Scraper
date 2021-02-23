function setup($) {
    $.saj = $.saj || {};
    $.saj.certificado = $.saj.certificado || {};
    var env = (window.saj && window.saj.env) || {imagens: 'imagens'};

    var ENTER_KEY = 13;
    var pki;
    var inicializacaoWebSignerComErro;
    var $defaultOption = $('<option>');
    $defaultOption.text(dict['certificado.msgCarregandoCertificado']);
    var $noOption = $('<option>');
    $noOption.text(dict['certificado.msgNenhumCertificadoEncontrado']);
    var $erroCarregarCertificadoOption = $('<option>');
    $erroCarregarCertificadoOption.text(dict['certificado.msgErroCarregarCertificado']);

    var logarExcecaoNoServidor = function (excecao) {
        $.ajax({
            url: env.root ? env.root + '/registrarLog.do' : 'registrarLog.do',
            data: {
                message: excecao,
                loggerName: 'br.com.softplan.unj.SajWebSigner'
            },
            type: 'POST'
        });
    };

    var atualizarImagemCarregamentoCertificado = function (isCarregando, $comboCertificados) {
        var id = '#' + ($comboCertificados ? $comboCertificados.attr('id') : $('#certificados').attr('id'));
        var botaoRecarregar = $(id + '-recarregar');
        if (!botaoRecarregar.length) {
            return;
        }
        if (isCarregando) {
            botaoRecarregar.attr("src", window.saj.env.imagens + "/certificado/recarregarCertificados-p.gif");
        } else {
            botaoRecarregar.attr("src", window.saj.env.imagens + "/certificado/recarregarCertificados.png");
        }
    };

    var getDataExpiracaoFormatada = function (dataExpiracao) {
        return dataExpiracao.getDate() + "/" + (dataExpiracao.getMonth() + 1) + "/" + dataExpiracao.getFullYear();
    };

    var isStringEmpty = function (string) {
        return !string || string.trim() === '';
    };

    var removeNaoDigitos = function (string) {
        return string && string.replace(/\D/g, '');
    };

    var isCpfCnpjUsuarioLogado = function (pkiBrazil) {
        return pkiBrazil && !isStringEmpty($.saj.certificado.cpfCnpjUsuarioLogado) && removeNaoDigitos($.saj.certificado.cpfCnpjUsuarioLogado) === removeNaoDigitos(pkiBrazil.cnpj || pkiBrazil.cpf);
    };

    var compararBoolean = function (a, b) {
        if (a === b) {
            return 0;
        } else if (a) {
            return -1;
        }
        return 1;
    };

    var mapCertificadosCofreDigital = function (registrosChavesUsuarioCofreDigital) {
        return $.map(registrosChavesUsuarioCofreDigital, function (chaveUsuarioCofreDigital) {
            var pkiBrazil = {};
            var cpfCnpj = chaveUsuarioCofreDigital.compartimento.titular.cpfCnpj;
            var chaveCpfCnpj = cpfCnpj.replace(/[.-]/g, '').length > 11 ? 'cnpj' : 'cpf';
            pkiBrazil[chaveCpfCnpj] = cpfCnpj;
            var inicioValidade = new Date();
            inicioValidade.setDate(inicioValidade.getDate() - 5);
            return {
                thumbprint: chaveUsuarioCofreDigital.uuid,
                validityEnd: new Date(chaveUsuarioCofreDigital.certificado.naoDepois),
                validityStart: inicioValidade,
                cofreDigital: true,
                subjectName: chaveUsuarioCofreDigital.certificado.assunto.cn,
                pkiBrazil: pkiBrazil
            };
        });
    };

    var mesclarCertificados = function (certificadosCofreDigitalParam, certificadosWebSignerParam) {
        var certificadosCofreDigital = certificadosCofreDigitalParam || [];
        var certificadosWebSigner = certificadosWebSignerParam || [];
        return $.when([].concat(mapCertificadosCofreDigital(certificadosCofreDigital), certificadosWebSigner));
    };

    var ordenarCertificadosAdicionandoLabel = function (certs) {
        var dataAtual = new Date().getTime();
        var certsTransformados = $.map(certs, function (cert) {
            var certTransformado = {
                thumbprint: cert.thumbprint,
                expired: cert.validityEnd.getTime() < dataAtual,
                notYetValid: cert.validityStart.getTime() > dataAtual,
                nonPkiBrazil: !cert.pkiBrazil || (isStringEmpty(cert.pkiBrazil.cnpj) && isStringEmpty(cert.pkiBrazil.cpf)),
                label: cert.subjectName + " - Validade: " + getDataExpiracaoFormatada(cert.validityEnd),
                validityEndTime: cert.validityEnd.getTime(),
                matchesCpfCnpj: isCpfCnpjUsuarioLogado(cert.pkiBrazil),
                cofreDigital: !!cert.cofreDigital
            };
            if (!!cert.cofreDigital) {
                certTransformado.label = '&#9729; ' + certTransformado.label;
            }
            if (certTransformado.expired) {
                certTransformado.label = dict['certificado.msgCertificadoExpirado'] + ' ' + certTransformado.label;
            } else if (certTransformado.notYetValid) {
                certTransformado.label = dict['certificado.msgCertificadoNaoValido'] + ' ' + certTransformado.label;
            } else if (certTransformado.nonPkiBrazil) {
                certTransformado.label = dict['certificado.msgCertificadoNaoIcpBrasil'] + ' ' + certTransformado.label;
            }
            certTransformado.valid = !certTransformado.expired && !certTransformado.notYetValid && !certTransformado.nonPkiBrazil;
            return certTransformado;
        });
        return certsTransformados.sort(function (a, b) {
            return compararBoolean(a.valid, b.valid)
                || compararBoolean(a.matchesCpfCnpj, b.matchesCpfCnpj)
                || (a.validityEndTime > b.validityEndTime ? -1 : 1);
        });
    };

    var ajustarCertificadosEncontrados = function (certs, $comboCertificados) {
        var $certificados = $comboCertificados || $('#certificados');
        if (!certs.length) {
            $certificados.html($noOption);
            return;
        }
        var certificadosCarregados = ordenarCertificadosAdicionandoLabel(certs);
        $.each(certificadosCarregados, function (i, cert) {
            var $option = $('<option>');
            $option.data('cofre-digital', cert.cofreDigital);
            $option.val(cert.thumbprint);
            $option.css('color', cert.valid ? 'inherited' : '#BABABA');
            $option.html(cert.label);
            $certificados.append($option);
        });
        $certificados.find('option:first').remove();
        $.saj.certificado.desbloquearActionCertificado();
        atualizarImagemCarregamentoCertificado(false, $comboCertificados);
        return $.when(certificadosCarregados);
    };

    /**
     * Busca os certificados no cofre digital a partir do cpf/cnpj do usuário logado ou do cpf passado como parâmetro
     *
     * @param {String} [cpfCnpj] cpfCnpj do usuário
     * @return {Promise} que resolverá com o json dos certificados do usuário, ou false caso não esteja habilitada a funcionalidade de certificados na nuvem.
     * Caso haja erro na requisição, a promise será rejeitada com o conteúdo da response.
     */
    var carregarCertificadosCofreDigital = function (cpfCnpj) {
        var $q = $.Deferred();
        $.ajax({
            url: $.saj.certificado.cofreDigital.enderecoBase + '/buscarCertificadosCofreDigital.do',
            type: 'GET',
            data: {
                cpfCnpj: cpfCnpj
            },
            traditional: true
        }).done(function (content, textStatus, response) {
            if (response.status === 204) {
                return $q.resolve(false);
            }
            $q.resolve(content);
        }).fail(function (response) {
            $q.reject(response);
        });
        return $q.promise();
    };

    var carregarCertificados = function (options) {
        options = options || {};
        var promiseCertificadosCofreDigital = $.when([]);
        var $qCertificadosCofreDigital = $.Deferred();
        if ($.saj.certificado.cofreDigital.habilitado && options.cofreDigital) {
            promiseCertificadosCofreDigital = carregarCertificadosCofreDigital(options.cpfCnpj)
                .fail(function () {
                    return $qCertificadosCofreDigital.resolve([]);
                });
        }
        promiseCertificadosCofreDigital.then($qCertificadosCofreDigital.resolve);
        var promiseCarregarCertificadosWebSigner = $.when([]);
        var $qCertificadosWebSigner = $.Deferred();
        if (!inicializacaoWebSignerComErro && options.webSigner) {
            promiseCarregarCertificadosWebSigner = carregarCertificadosWebSigner()
                .fail(function () {
                    return $qCertificadosWebSigner.resolve([]);
                });
        }
        promiseCarregarCertificadosWebSigner.then($qCertificadosWebSigner.resolve);
        return $.when($qCertificadosCofreDigital.promise(), $qCertificadosWebSigner.promise())
                .then(function (certificadosCofreDigital, certificadosWebSigner) {
                    return mesclarCertificados(certificadosCofreDigital, certificadosWebSigner)
                        .then(function (certificados) {
                            return ajustarCertificadosEncontrados(certificados);
                        })
                })
                .fail(function (err) {
                    console.error(err);
                });
    };

    var carregarCertificadosWebSigner = function (tentativas) {
        if (!tentativas) {
            tentativas = 1;
        }
        var $q = $.Deferred();
        pki.listCertificates()
           .success(function (certificados) {
               $q.resolve(certificados);
           }).error(function (message, error, origin) {
            if (tentativas++ <= 3) {
                $q.resolve(carregarCertificadosWebSigner(tentativas));
                return;
            }
            console.error("\nMessage: " + "ERRO NO CARREGAMENTO DE CERTIFICADOS: " + message + "\nError: " + error + "\nOrigin: " + origin);
            logarExcecaoNoServidor("\nMessage: " + message + "\nError: " + error + "\nOrigin: " + origin);
            $q.reject({message: message, error: error, origin: origin});
        });
        return $q.promise();

    };


    var bindBotoes = function (options) {
        var optionsBind = options || {};
        var $certificados = optionsBind.comboCertificados || $('#certificados');
        $('#' + $certificados.attr('id') + 'Recarregar').off('click').on('click', function () {
            atualizarImagemCarregamentoCertificado(true, $certificados);
            $.saj.certificado.bloquearActionCertificado();
            $certificados.html($defaultOption);
            carregarCertificados({webSigner: optionsBind.webSigner, cofreDigital: optionsBind.cofreDigital, cpfCnpj: options.cpfCnpj})
                .always(function () {
                    atualizarImagemCarregamentoCertificado(false, $certificados);
                });
            return false;
        });
        $('#redirecionarParaPaginaInstalacao').off('click').on('click', function () {
            pki.redirectToInstallPage();
        });
        $('.fecharModalInstalacao').off('click').on('click', function () {
            $.saj.closePopupModal();
            return false;
        });
    };

    var lacunaInicializado = function ($comboCertificados) {
        $.saj.certificado.bloquearActionCertificado();
        return carregarCertificadosWebSigner()
            .then(function (certificadosWebSigner) {
                return ajustarCertificadosEncontrados(certificadosWebSigner, $comboCertificados);
            })
            .fail(function (error) {
                $('#certificados').html($erroCarregarCertificadoOption);
                return $.Deferred().reject(error);
            })
            .always(function () {
                atualizarImagemCarregamentoCertificado(false, $comboCertificados);
            });
    };

    var ajustarBrand = function (brand) {
        if (brand) {
            var marcaEstaCorreta = brand.indexOf('tj', 0) === 0 || brand.indexOf('TJ', 0) === 0
            if (!marcaEstaCorreta) {
                return 'TJ' + brand;
            }
        }
        return brand;
    };

    /**
     * Método para inicialização e carregamento de certificados pelo websigner.
     *
     * @param callback
     * @param brand
     * @deprecated utilizar $.saj.certificado.inicializarAssinador()
     */
    $.saj.certificado.inicializar = function (callback, brand) {
        console.warn('Este método de inicialização dos certificados está `deprecated` e será removido nas próximas versões. Utilize no lugar $.saj.certificado.inicializarAssinador()');
        return $.saj.certificado.inicializarWebSigner({
            depoisDeInicializado: callback,
            naoInstalado: function (status) {
                notInstalled(status);
                if (callback) {
                    callback(false);
                }
            }
        });
    };

    var notInstalled = function (status) {
        mostrarModalCorrespondenteAoStatus(status);
        if (status !== 3) {
            $('#certificados').html($noOption);
        }
    };

    var mostrarModalCorrespondenteAoStatus = function (status) {
        var $html = $('#webSignerNaoInstalado');
        if (status === 3) {
            $html = $('#webSignerNaoSuportado');
        }
        $.saj.popupModal($html, {
            mostrarBotaoFechar: false,
            titulo: dict['certificado.tituloCertificadoDigital'],
            largura: 400,
            altura: 0
        });
        $('.actionPrincipal:visible').focus();
    };


    /**
     * Inicializa o websigner (se o parâmetro inicializarSomenteCofreDigital não for passado ou for passado false) e carrega
     * o combo de certificados digitais, mesclando certificados em nuvem e certificados do websigner
     *
     * @param {Object} [params] parâmetros de inicialização de assinador
     * @param {boolean} [params.inicializarSomenteCofreDigital] indica se devem ser carregados somente certificados em nuvem
     * @param {string} [params.cpfCnpj] indica cpf ou cnpj do usuário a ser buscado
     */
    $.saj.certificado.inicializarAssinador = function (params) {
        var paramsAssinador = $.extend({}, params);
        var $q = $.Deferred();
        bindBotoes({comboCertificados: paramsAssinador.comboCertificados, webSigner: !paramsAssinador.inicializarSomenteCofreDigital, cofreDigital: true, cpfCnpj: paramsAssinador.cpfCnpj});
        $.saj.certificado.bloquearActionCertificado();
        carregarCertificadosCofreDigital(paramsAssinador.cpfCnpj)
            .then(function (certificadosCofreDigital) {
                // Inicializa promise de websigner com array vazio
                var promiseCertificadosWebSigner = $.when([]);
                // Caso deva carregar certificados do websigner, chama método e armazena promise
                if (!paramsAssinador.inicializarSomenteCofreDigital) {
                    promiseCertificadosWebSigner = _inicializarWebSigner()
                        .then(function () {
                            return carregarCertificadosWebSigner();
                        });
                }
                // Ao concluir promise do websigner, faz o merge entre certificados do cofre digital e do websigner e inicialização do combo
                promiseCertificadosWebSigner
                    .then(function (certificadosWebSigner) {
                        mesclarCertificados(certificadosCofreDigital, certificadosWebSigner)
                            .then(function (certificados) {
                                return ajustarCertificadosEncontrados(certificados, paramsAssinador.comboCertificados);
                            })
                            .then($q.resolve);
                    })
                    .fail(function (status) {
                        inicializacaoWebSignerComErro = true;
                        // Caso promise de inicialização do websigner falhe, verifica se foram carregados certificados da nuvem.
                        // Caso negativo, apresenta mensagem de acordo com status do websigner
                        if (!certificadosCofreDigital || !certificadosCofreDigital.length) {
                            notInstalled(status);
                            return $q.reject({falhaWebSigner: true});
                        }
                        // Caso websigner falhe e certificados da nuvem estejam disponíveis, faz a inicialização do combo
                        mesclarCertificados(certificadosCofreDigital, [])
                            .then(function (certificados) {
                                return ajustarCertificadosEncontrados(certificados, paramsAssinador.comboCertificados);
                            })
                            .then($q.resolve);
                    });
            })
            .fail(function (response) {
                // Caso falhe a inicialização do cofre digital e seja inicialização apenas por certificados na nuvem, apresenta mensagem de resposta e rejeita promise de inicialização
                if (paramsAssinador.inicializarSomenteCofreDigital) {
                    alert('<p>' + response.responseText + '</p>');
                    console.error('Falha ao inicializar ');
                    return $q.reject(false);
                }
                // Caso tenha falhado a inicialização do websigner e não tenha certificados disponíveis da nuvem, rejeita promise de inicialização
                if (response && response.falhaWebSigner) {
                    return $q.reject(false);
                }
                // Caso tenha falhado a inicialização dos certificados em nuvem e não tenha batido nas condições anteriores, tenta inicializar websigner
                return $.saj.certificado.inicializarWebSigner()
                        .then(function (certificadosWebSigner) {
                            $q.resolve(certificadosWebSigner);
                        })
                        .fail(function (status) {
                            inicializacaoWebSignerComErro = true;
                            notInstalled(status);
                            $q.reject(false);
                        });
            })
            .always(mostrarBotaoRefresh);
        return $q.promise();
    };

    var defaultOptions = {
        depoisDeInicializado: function () {
        },
        naoInstalado: notInstalled
    };

    var _inicializarWebSigner = function () {
        var $q = $.Deferred();
        pki = new SoftplanWebSigner($.saj.certificado.licenca);
        var brand = ajustarBrand($.saj.certificado.cliente);
        pki.init({
            ready: function () {
                $q.resolve();
            },
            notInstalled: function (status) {
                $q.reject(status);
            },
            brand: brand
        });
        return $q.promise();
    };

    var mostrarBotaoRefresh = function () {
        var $refresh = $('#certificadosRecarregar');
        $refresh.attr('display', 'inline');
        $refresh.show();
    };

    /**
     * Método que inicializa o WebSigner
     * o callback passado para ele é chamado após o mesmo ter sido inicializado
     *
     * @param options opções de inicialização
     * @param options.depoisDeInicializado callback chamado após inicialização
     * @param options.naoInstalado callback chamado em caso de falha na inicialização do websigner
     */
    $.saj.certificado.inicializarWebSigner = function (options) {
        var $q = $.Deferred();
        options = options || {};
        bindBotoes({comboCertificados: options.comboCertificados, webSigner: true, cofreDigital: false});
        var extendedOptions = $.extend(defaultOptions, options);
        _inicializarWebSigner()
            .then(function () {
                $q.resolve(lacunaInicializado(options.comboCertificados)
                    .then(function (certificadosWebSignerAjustados) {
                        if ($.isFunction(extendedOptions.depoisDeInicializado)) {
                            extendedOptions.depoisDeInicializado(certificadosWebSignerAjustados);
                        }
                        return certificadosWebSignerAjustados;
                    }));
            })
            .fail(function (status) {
                extendedOptions.naoInstalado(status);
                $q.reject(false);
            })
            .always(mostrarBotaoRefresh);
        return $q.promise();
    };


    $.saj.certificado.bloquearActionCertificado = function () {
        var $actionsCertificado = $('.actionCertificado,.actionCertificado-o');
        $actionsCertificado.each(function (index, actionCertificado) {
            var $actionCertificado = $(actionCertificado);
            if ($actionCertificado.hasClass('spwBotaoDefault') || $actionCertificado.hasClass('spwBotaoDefault-o')) {
                $actionCertificado.removeClass('spwBotaoDefault');
                $actionCertificado.removeClass('spwBotaoDefault-o');
                $actionCertificado.addClass('spwBotaoDefault-d');
            }
            if ($actionCertificado.hasClass('spwBotao')) {
                $actionCertificado.removeClass('spwBotao');
                $actionCertificado.addClass('spwBotao-d');
            }
        });
        $actionsCertificado.attr('disabled', 'disabled');
        $actionsCertificado.addClass('disabled');
        $('#certificados').attr('disabled', 'disabled');
    };

    $.saj.certificado.desbloquearActionCertificado = function () {
        var $actionsCertificado = $('.actionCertificado,.actionCertificado-o');
        $actionsCertificado.each(function (index, actionCertificado) {
            var $actionCertificado = $(actionCertificado);
            if ($actionCertificado.hasClass('spwBotaoDefault-d')) {
                $actionCertificado.removeClass('spwBotaoDefault-d');
                $actionCertificado.addClass('spwBotaoDefault');
            }
            if ($actionCertificado.hasClass('spwBotao-d')) {
                $actionCertificado.removeClass('spwBotao-d');
                $actionCertificado.addClass('spwBotao');
            }
        });
        $actionsCertificado.removeClass('disabled');
        $actionsCertificado.removeAttr('disabled');
        $('#certificados').removeAttr('disabled');
    };

    $.saj.certificado.isCertificadoWebSigner = function () {
        return $('#certificados option:selected').data('cofreDigital') !== true;
    };

    $.saj.certificado.getCertificado = function (callback) {
        if (callback) {
            console.warn('Método #$.saj.certificado.getCertificado retorna uma promise, o callback não deve mais ser utilizado pois será removido.');
        }
        var $q = $.Deferred();
        var thumbprint = $('#certificados').val();
        pki.readCertificate(thumbprint)
           .success(function (certificateBase64) {
               if ($.isFunction(callback)) {
                   callback(certificateBase64);
               }
               $q.resolve(certificateBase64);
           }).error($q.reject);
        return $q.promise();
    };

    var assinarLista = function (items, index, signatures, afterPromiseFunction, algoritmoCriptografia) {
        var onSuccess = function (signature) {
            signatures.push(signature);
            if (items.length === index + 1) {
                afterPromiseFunction(signatures);
            } else {
                assinarLista(items, index + 1, signatures, afterPromiseFunction, algoritmoCriptografia)
            }
        };
        return $.saj.certificado.assinar(items[index], onSuccess, algoritmoCriptografia);
    };

    $.saj.certificado.preAutorizarAssinaturas = function (quantidadeAssinaturasEsperadas) {
        return wrapPromise(pki.preauthorizeSignatures({
            certificateThumbprint: $('#certificados').val(),
            signatureCount: quantidadeAssinaturasEsperadas || 1
        }));
    };

    $.saj.certificado.assinarLista = function (hashs, afterPromiseFunction, algoritmoCriptografia) {
        return $.saj.certificado.preAutorizarAssinaturas(hashs.length).then(function () {
            return assinarLista(hashs, 0, [], afterPromiseFunction, algoritmoCriptografia);
        });
    };

    var assinarCofreDigital = function (urlAssinatura, data, uuidCert, pinUsuario) {
        var dadosRequest = $.extend({}, data, {
            uuidCertificadoCofreDigital: uuidCert,
            pinCertificadoCofreDigital: pinUsuario
        });
        return $.ajax({
            url: urlAssinatura,
            method: 'POST',
            traditional: true,
            data: dadosRequest
        });
    };

    var montarModalPin = function () {
        if ($('#modalPinCertificadoCofreDigital').length) {
            return;
        }
        $('.esajCelulaConteudoServico').append('<div id="modalPinCertificadoCofreDigital" style="display: none;" />');
        $('#modalPinCertificadoCofreDigital').html(
            '    <div style="width: 100%; -webkit-box-sizing: border-box; -moz-box-sizing: border-box; box-sizing: border-box; padding: 10px 20px; text-align: left;">\n' +
            '        <label id="labelPin" for="inputPin" style="margin: 5px 0; display: block;">\n' +
            '            Digite seu pin' +
            '        </label>\n' +
            '        <input id="inputPin" type="password" style="width: 100%;"/>\n' +
            '    </div>\n' +
            '    <div class="fundoCinzaSajModal footer_saj_modal alinhamentoDireitaSajModal">\n' +
            '        <div class="boxInternoSajModal alinhamentoDireitaSajModal">\n' +
            '            <span class="espacoDireitaSajModal">\n' +
            '                <input type="button" id="confirmarDigitacaoPin" onmouseover="B_mOver(this);" onmouseout="B_mOut(this);" value="Confirmar" class="spwBotaoDefault-o"/>\n' +
            '                <input type="button" id="cancelarDigitacaoPin" onmouseover="B_mOver(this);" onmouseout="B_mOut(this);" value="Cancelar" class="spwBotao"/>\n' +
            '            </span>\n' +
            '        </div>\n' +
            '    </div>\n' +
            '</div>');
    };

    $.saj.certificado.solicitarPinCertCofreDigital = function () {
        var $q = $.Deferred();
        montarModalPin();
        $('#modalPinCertificadoCofreDigital')
            .off('fechandoModalSemAcao')
            .on('fechandoModalSemAcao', function () {
                $q.reject();
            });
        $.saj.closePopupModal();
        $.saj.popupModal($('#modalPinCertificadoCofreDigital'), {
            mostrarBotaoFechar: false,
            titulo: dict['certificado.tituloCertificadoDigital'],
            largura: 400,
            altura: 150,
            antesDeMostrarPopup: function () {
                $('#inputPin').val('');
                $('#inputPin')
                    .off('keydown')
                    .on('keydown', function (event) {
                        if (event.which === ENTER_KEY) {
                            $.saj.closePopupModal();
                            $q.resolve($(this).val());
                        }
                    });
                $('#cancelarDigitacaoPin')
                    .off('click')
                    .on('click', function () {
                        $.saj.closePopupModal();
                        $q.reject();
                    });
                $('#confirmarDigitacaoPin')
                    .off('click')
                    .on('click', function () {
                        $.saj.closePopupModal();
                        $q.resolve($('#inputPin').val());
                    });
                $('#labelPin').focus();
            }
        });
        return $q.promise();
    };

    /**
     * Solicita o pin para o usuário e faz requisição para assinatura com o certificado selecionado, se o mesmo for certificado da nuvem
     *
     * @param {Object} opcoes objeto com opções
     * @param {string} opcoes.urlAssinatura url para requisição da assinatura. Esta url receberá o uuid e o pin do certificado
     * @param {Object} [opcoes.data] dados extras a serem enviados para o endpoint de assinatura, além do pin e do uuid do certificado
     * @param {function} [opcoes.mensagemFeedback] função para apresentação de mensagem de feedback ao usuário após usuário digitar o pin
     */
    $.saj.certificado.assinarCofreDigital = function (opcoes) {
        var $q = $.Deferred();
        if (!opcoes) {
            console.error('Solicitada assinatura sem parâmetros');
            return $q.reject();
        }
        if (!opcoes.urlAssinatura) {
            console.error('Url para requisição de assinatura não passada');
            return $q.reject();
        }
        if ($.saj.certificado.isCertificadoWebSigner()) {
            console.warn('Solicitada assinatura para cofre digital com certificado webSigner');
            return $q.reject();
        }
        var uuidCert = $('#certificados').val();
        $.saj.certificado.solicitarPinCertCofreDigital()
         .then(function (pinUsuario) {
             if ($.isFunction(opcoes.mensagemFeedback)) {
                 opcoes.mensagemFeedback();
             }
             return pinUsuario;
         })
         .then(function (pinUsuario) {
             assinarCofreDigital(opcoes.urlAssinatura, opcoes.data, uuidCert, pinUsuario)
                 .then($q.resolve)
                 .fail($q.reject);
         })
         .fail(function (e) {
             $q.reject(e);
         });
        return $q.promise();
    };

    var isFalhaAoAssinar = function (message) {
        return message.indexOf('user cancelled') === -1 && message.indexOf('User canceled') === -1 && message.indexOf('cancelada pelo') === -1
    };

    var wrapPromise = function (webSignerTask) {
        var $q = $.Deferred();
        webSignerTask.success(function (data) {
            $q.resolve(data);
        }).error(function (message, error, origin) {
            var errorData = {
                message: message,
                error: error,
                origin: origin,
                failed: isFalhaAoAssinar(message)
            };
            if (errorData.failed) {
                logarExcecaoNoServidor("\nMessage: " + message + "\nError: " + error + "\nOrigin: " + origin);
            }
            $.saj.certificado.desbloquearActionCertificado();
            $q.reject(errorData);
        });
        return $q.promise();
    };
    /**
     * Metodo efetua a assinatura utilizando web-signer. Está atrelado a componentes de view
     *
     * @param {Object} options   Parâmetro único contendo as informações necessárias para processamento da assinatura
     * @param {String} options.digestAlgorithm   Algoritmo de criptografia utilizado na assinatura. Default: SHA-256
     * @param {String} options.thumbprint    Thumbprint do certificado selecionado. Default: $('#certificados').val()
     * @param {String} options.hash    Hash do conteúdo a ser assinado (pré-calculado). Esse atributo é obrigatório caso options.data não esteja preenchido.
     * @param {String} options.data    Conteúdo a ser assinado. Esse atributo é obrigatório caso options.hash não esteja preenchido.
     * @return {Promise<String|Object>}    Em caso de sucesso retornará a assinatura na base64. Em caso de erro um object: {message, error, origin, failed}
     *                                     (a propriedade failed=true indica se o erro foi efetivamente uma falha do websigner. failed=false geralmente indica cancelamento da operação)
     */

    $.saj.certificado.assinarPromise = function (options) {
        var mergedOptions = $.extend({digestAlgorithm: 'SHA-256', thumbprint: $('#certificados').val()}, options);
        $.saj.certificado.bloquearActionCertificado();
        var sigTask = mergedOptions.hash ? pki.signHash(mergedOptions) : pki.signData(mergedOptions);
        return wrapPromise(sigTask);
    };

    var tratarFalhaAssinatura = function (errorData) {
        if (errorData.failed) {
            if ($.saj.closePopupModal) {
                $.saj.closePopupModal(errorData);
            }
            $.saj.popupModalAjax($.saj.certificado.urlConteudoAjudaWebSigner, {
                data: errorData,
                metodo: 'POST',
                mostrarBotaoFechar: false,
                titulo: dict['certificado.tituloProblemasAoAssinar'],
                largura: 640,
                altura: 0
            });
            $('.actionPrincipal:visible').focus();
        }
    };

    /**
     * Metodo assinar o conteudo, repassando para callback no caso de sucesso. Em caso de erro (que nao seja cancelamento), será apresentado um popup generico de erro
     *
     * @param data conteudo para ser assinado
     * @param funcao (funcao invocada no caso de sucesso). Sera repassado a assinatura
     * @param algoritmoCriptografia (algoritmo de criptografia a ser utilizado. Default é SHA-256)
     * @return {Promise<String|Object>}    Em caso de sucesso retornará a assinatura na base64. Em caso de erro um object: {message, error, origin, failed}
     *                                     (a propriedade failed=true indica se o erro foi efetivamente uma falha do websigner. failed=false geralmente indica cancelamento da operação)
     * @deprecated Utilizar assinarPromise
     */
    $.saj.certificado.assinar = function (data, funcao, algoritmoCriptografia) {
        var options = {data: data};
        if (algoritmoCriptografia) {
            options.digestAlgorithm = algoritmoCriptografia;
        }
        return $.saj.certificado.assinarPromise(options).fail(tratarFalhaAssinatura).then(funcao);
    };

    /**
     * Metodo assinara o hash ja calculado e carregara o certificado associado utilizado, persistindo certificado no input #certificadoSelecionado
     *
     * Em caso de erro (que nao seja cancelamento), será apresentado um popup generico de erro
     *
     * @param hash conteudo para ser assinado (digest ja calculado)
     * @param funcao (funcao invocada no caso de sucesso)
     * @param algoritmoCriptografia (algoritmo de criptografia a ser utilizado. Default é SHA-256)
     * @return {Promise<String|Object>}    Em caso de sucesso retornará a assinatura na base64. Em caso de erro um object: {message, error, origin, failed}
     *                                     (a propriedade failed=true indica se o erro foi efetivamente uma falha do websigner. failed=false geralmente indica cancelamento da operação)
     * @deprecated Utilizar assinarPromise
     */
    $.saj.certificado.assinarHash = function (hash, funcao, algoritmoCriptografia) {
        var options = {hash: hash};
        if (algoritmoCriptografia) {
            options.digestAlgorithm = algoritmoCriptografia;
        }
        return $.saj.certificado.assinarPromise(options).fail(tratarFalhaAssinatura).then(function (signature) {
            wrapPromise(pki.readCertificate($('#certificados').val())).fail(tratarFalhaAssinatura).then(function (certificadoBase64) {
                $('#certificadoSelecionado').val(certificadoBase64);
                funcao(signature);
            });
        })
    };

    var redirecionarParaPaginaDeInstalacao = function () {
        pki.redirectToInstallPage();
    };

    $.saj.certificado.getUrlInstalacao = function () {
        if (!pki) return '';
        if (pki.brand) return pki._installUrl + pki.brand;
        else return pki._installUrl
    };

    $.saj.certificado.mostrarModalCorrespondenteAoStatus = mostrarModalCorrespondenteAoStatus;
    $.saj.certificado.redirecionarParaPaginaDeInstalacao = redirecionarParaPaginaDeInstalacao;
}

/*global define:true */
if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(['jquery'], setup);
} else if (typeof exports === 'object') {
    // Node/CommonJS
    setup(require('jquery'));
} else {
    if (window.jQuery) {
        setup(jQuery);
    }
}
