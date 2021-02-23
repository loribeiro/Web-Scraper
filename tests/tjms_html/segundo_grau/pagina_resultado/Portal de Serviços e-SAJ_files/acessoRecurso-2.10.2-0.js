(function($) {

	var KEY_CODE = {
		ENTER : 13,
		ESC: 27
	};

	var parametrosPopupPasta = 'location=no, toolbar=no, resizable=yes';
	if(jQuery.browser.msie) {
		parametrosPopupPasta += ', screenX=0,screenY=0,left=0,top=0';
		var width = screen.availWidth * 0.99;
		var height = screen.availHeight * 0.96;
		parametrosPopupPasta += ', width=' + width + ', height=' + height;
	}

	$(function() {
		$('a.linkPasta').click(function(){
			verificarAcessoPastaDigital($(this));
		});
		$('a.linkMovVincProc').click(function(){
			verificarAcessoMovimentacao($(this));
		});
		$('a.linkMovimentacaoMidiasProcesso').click(function(){
			var $this = $(this);
			var url = obterUrlBase() + "/verificarAcessoMidiasDaMovimentacao.do?cdProcesso=" + getCdProcesso() + "&cdDocumento=" + $this.attr('cdDocumento');
			verificarAcessoMidiasMovimentacao(url, $this);
		});
		$('a.linkGravacoesAudiencia').click(function(){
			verificarAcessoRecursoAutorizado(obterUrlBase() + "/verificarAcessoAudienciaPrimeiraInstancia.do?cdProcesso="+getCdProcesso(),{ urlRecursoAcessado: $(this).attr('href'), midiaAudiencia: $(this).attr('id') });
			return false;
		});
	});


	var verificarAcessoRecursoAutorizado = function(urlValidacaoAcessoRecurso, data) {
		$.ajax({
			url: urlValidacaoAcessoRecurso,
			async: false,
			cache: false,
			data: data,
			success: function(urlAcessoRecurso){
				validarAcessoCasoAudiencia(data);
				abrirPopupRecurso(urlAcessoRecurso);
			},
			error: function(htmlPopupSenha) {
			    if (htmlPopupSenha.status != 200) {
				    abrirPopupSenha(htmlPopupSenha.responseText, urlValidacaoAcessoRecurso, data, verificarAcessoRecursoAutorizado);
                }
			}
		});
	};

	var validarAcessoCasoAudiencia = function(data){
		if(data && data.midiaAudiencia){
			$('[id="'+data.midiaAudiencia+'"]').siblings('div').toggle();
			return false;
		}
	};

	var abrirPopupRecurso = function (urlRecurso) {
		if(urlRecurso) {
			window.open(urlRecurso, '', parametrosPopupPasta);
		}
	};

	var fecharModalDeSenha = function() {
		$.saj.closePopupModal();
	};

	var abrirPopupSenha = function(htmlPopupSenha, url, data, callSuccessRecurso) {
		$.saj.popupModal(htmlPopupSenha, {
			altura:230,
			largura:580,
			titulo: 'Senha do processo',
			criarBarraDeRolagem: false,
			antesDeMostrarPopup: function() {
				ajustarAcessibilidadeModalSenha();
		    },
		    onBeforeClosePopupModal: function() {
		    	$('.div-conteudo').attr('aria-hidden','false');
			},
			mostrarBotaoFechar: false
		});
		$('#popupSenhaProcesso').show();
		var botaoEnviaSenha = $('#botaoEnviarSenha');
		botaoEnviaSenha.click(function(){
			validarSenhaProcesso(url, data, callSuccessRecurso);
		});
		$(document).keyup(function(evento){
			if (evento.which == KEY_CODE.ENTER) {
				botaoEnviaSenha.click();
			}
			if(evento.which == KEY_CODE.ESC) {
				fecharModalDeSenha();
			}
		});
		$('#botaoFecharPopupSenha').click(function(){
			fecharModalDeSenha();
		});
	};

	var ajustarAcessibilidadeModalSenha = function(){
		$('.div-conteudo').attr('aria-hidden','true');
		$('#senhaProcesso').attr('aria-label','Senha do processo').attr('tabindex','4');
		$('#btEnviarSenha').attr('tabindex','6');
		$('#botaoFecharPopupSenha').attr('tabindex','7');
		focusPrimeiraMsgModalSenha();
		$('#botaoFecharPopupSenha').bind('keydown', function(e){
            if(e.keyCode === 9) {
            	focusPrimeiraMsgModalSenha();
            }
            e.preventDefault();
            e.stopPropagation();
		});
	}

	var focusPrimeiraMsgModalSenha = function(){
		var msgErro = $('.msgErroSenha');
		if(msgErro.is(':visible')){
			msgErro.focus();
		} else {
			$('.orientacao121').focus();
		}
	}


	var validarSenhaProcesso = function(url, data, callSuccessRecurso) {
		$.ajax ({
			type: 'POST',
			url: window.saj.env.root + '/validarSenhaAcessoProcesso.do',
			data: {
				senhaDoProcessoDigitada: $('#senhaProcesso').val(),
				cdProcesso: getCdProcesso()
			},
			success:function(cdProcesso) {
				fecharModalDeSenha();
				callSuccessRecurso(url, data);
			},
			error:function() {
				definirMensagemErroSenha(arguments[0].responseText);
				$('#popupSenhaProcesso').find('#spwTabelaMensagem').show();
			}
		});
	};

	var definirMensagemErroSenha = function(erro){
		if (erro==='senhaExpirada'){
			$('#msgErroSenha').html(window.saj.cpo.mensagemErroSenhaExpirada);
			return;
		}
		$('#msgErroSenha').html(window.saj.cpo.mensagemErroSenha);
	}

	var verificarAcessoMovimentacao = function($elementoClicado) {
		var url = obterUrlBase() + "/verificarAcessoMovimentacao.do?cdDocumento=" + $elementoClicado.attr('cdDocumento') + '&origemRecurso=' + $elementoClicado.attr('name') + "&cdProcesso=" + getCdProcesso();
		verificarAcessoRecursoAutorizado(url);
	};

	var verificarAcessoPastaDigital = function() {
		var url = obterUrlBase() + "/verificarAcessoPastaDigital.do?cdProcesso=" + getCdProcesso();
		verificarAcessoRecursoAutorizado(url);
	};

    var verificarAcessoMidiasMovimentacao = function (url, $elementoClicado) {
		if ($elementoClicado.attr('aria-expanded') === 'true') {
			return;
		}
        var callbackSuccess = function (data) {
			$elementoClicado.attr('aria-expanded', 'true');
            var meuDiv = $("#"+$elementoClicado.attr('tableName')+"-mostrarArquivos-"+$elementoClicado.attr('cdDocumento'));
			$(meuDiv).empty();
			meuDiv.append(data.responseText);
        };
        $.ajax({
            url: url,
            cache: false,
            data: null,
            success: function(data) {
            	console.log("SUCESSO!!");
            	console.log(data);
			},
            error: function (data) {
                if (data.status == 403) {
					$elementoClicado.attr('aria-expanded', 'false');
                    abrirPopupSenha(data.responseText, url, $elementoClicado, verificarAcessoMidiasMovimentacao);
                } else if (data.status == 200) {
                    callbackSuccess(data);
                }
            }
        });
    };

	var downloadMidiaDigitalByMovimentacao = function($elementoClicado) {

		window.open(obterUrlBase() + "/downloadMidiaDigitalByMovimentacao.do?cdDocumento=" + $elementoClicado.attr('cdDocumento') +
			"&cdProcesso=" + getCdProcesso() +
			"&nmArquivo=" + $elementoClicado.attr('nmArquivo') +
			"&pathArquivo=" + encodeURIComponent($elementoClicado.attr('pathArquivo')));
	};

	$.saj = $.saj || {};
	$.saj.downloadMidiaDigitalByMovimentacao = downloadMidiaDigitalByMovimentacao;

	var alternarExibicaoDivGravacoesAudiencia = function() {
		var linkAudiencia = $(this);
		if(linkAudiencia.attr('aria-expanded') == 'true'){
			linkAudiencia.attr('aria-expanded','false');
		} else {
			linkAudiencia.attr('aria-expanded','true');
		}
		linkAudiencia.siblings('div').toggle();
		return false;
	};

	var getCdProcesso = function(){
		return $('input:hidden[name="cdProcesso"]').val();
	}


	var obterUrlBase = function() {
		return window.saj.env.root;
	};

})(jQuery);
