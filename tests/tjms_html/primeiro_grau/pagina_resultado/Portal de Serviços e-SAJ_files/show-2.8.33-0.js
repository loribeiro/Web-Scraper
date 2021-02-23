(function($) {
	
	var abrirPopupSenha = function() {
		var idRecursoQueProvocouLiberacaoPorSenha = $(this).attr('id');
		$('input[name="idRecursoQueProvocouLiberacaoPorSenha"]').val(idRecursoQueProvocouLiberacaoPorSenha);
		mostrarPopupSenhaProcesso();
		return false;
	};
	
	var abrirPastaDigitalDoRecurso = function() {
		var $link = $(this);
		var targetPopup = $link.attr('target');
		if(targetPopup) {
			window.open($link.attr('href'), targetPopup, 'menubar=no,statusbar=no,location=no,toolbar=no,resizable=yes');
		} else {
			window.location.href = $link.attr('href');
		}
		return false;
	};
	
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
	
	var abrirAutoQueProvocouLiberacaoPorSenha = function($linksRecurso, funcaoAbrirRecurso) {
		if($.saj.acessoRecurso.idRecursoQueProvocouLiberacaoPorSenha) {
			funcaoAbrirRecurso.call($linksRecurso.filter('#' + $.saj.acessoRecurso.idRecursoQueProvocouLiberacaoPorSenha));
		}
	};
	
	var abrirPainelAudienciasGravadas = function(){
		if($.saj.acessoRecurso.idRecursoQueProvocouLiberacaoPorSenha) {
			document.location.href="#audienciasPlaceHolder";
			$('#' + $.saj.acessoRecurso.idRecursoQueProvocouLiberacaoPorSenha).click();
		}
	};
	
	var abrirMidiaVinculadaAoDocumento = function(){
		if($.saj.acessoRecurso.idRecursoQueProvocouLiberacaoPorSenha) {
			var mida = $('#' + $.saj.acessoRecurso.idRecursoQueProvocouLiberacaoPorSenha);
			mida.click(function() {
				window.open(mida.attr('href'));
			});
			mida.click();
		}
	};
	
	var isRecursoAutorizadoTipoAudiencia = function(){
		return ($.saj.acessoRecurso.idRecursoQueProvocouLiberacaoPorSenha.indexOf('linkGravacoesAudiencia') >= 0); 
	};
	
	var isRecursoAutorizadoMidiaDoDocumentoDaMovimentacao = function(){
		return ($.saj.acessoRecurso.idRecursoQueProvocouLiberacaoPorSenha.indexOf('linkMidiaVincMov') >= 0); 
	};
	
	var prepararLinkAcessoAutosPedindoSenhaRetornarBindRealizado = function (link){
		if (link.attr('href').indexOf('#liberarAutoPorSenha') === 0) {
			link.click(abrirPopupSenha);
			return true;
		}
		return false;
	};
	
	var prepararLinkAcessoAutosPastaDigital = function(){
		var $this = $(this);
		if(prepararLinkAcessoAutosPedindoSenhaRetornarBindRealizado($this)){
			return;
		}
		$this.click(abrirPastaDigitalDoRecurso);
		if($.saj.acessoRecurso.abrirPastaDigitalEmPopup) {
			$this.attr('target', '_blank');
		}
			
	};
	var prepararLinkAcessoAutosAudienciaGravada = function(){
		var $this = $(this);
		if(prepararLinkAcessoAutosPedindoSenhaRetornarBindRealizado($this)){
			return;
		}
		$this.click(alternarExibicaoDivGravacoesAudiencia);
	};
	
	var prepararLinksAcessoAosAutos = function() {
		var $linksAutosPastaDigital = $('a.linkPasta,a.linkMovVincProc');
		$linksAutosPastaDigital.each(prepararLinkAcessoAutosPastaDigital);
		var $linksGravacoesAudiencia = $('a.linkGravacoesAudiencia');
		$linksGravacoesAudiencia.each(prepararLinkAcessoAutosAudienciaGravada);
		$('a.linkMidiaMov').each(function(){
			prepararLinkAcessoAutosPedindoSenhaRetornarBindRealizado($(this));
		});
		
		if($.saj.acessoRecurso.popupSenha.mostrar) {
			return;
		}
		
		if(isRecursoAutorizadoTipoAudiencia()){
			abrirPainelAudienciasGravadas();
			return;
		}
		if(isRecursoAutorizadoMidiaDoDocumentoDaMovimentacao()){
			abrirMidiaVinculadaAoDocumento();
			return;
		}
		abrirAutoQueProvocouLiberacaoPorSenha($linksAutosPastaDigital, abrirPastaDigitalDoRecurso);
	};
	
	var exibirPopupSenhaSeNecessario = function() {
		if($.saj.acessoRecurso.popupSenha.mostrar) {
			mostrarPopupSenhaProcesso();
		}                     
	};
	
	/*
	 * Quando o popup da senha é fechado é necessário remover possivel mensagem  de validacao diminuindo tamanho do popup
	 */
	var prepararBotaoFecharPopupSenha = function() {
		$('#botaoFecharPopupSenha').click(function() {
            verificaSeDeveRedirecionaParaPesquisa();
			$.saj.closePopupModal();
			$.saj.acessoRecurso.popupSenha.alturaAdicionalParaMensagemValidacao = 0;
		});
	};

    /**
     * Quando consultado um processo em segredo de justiça ao clicar em fechar a modal, deve redirecionar para o
     * formulário de pesquisa, isso evita que ao fechar a modal sem informar a senha os dados não sejam carregados
     */
	var verificaSeDeveRedirecionaParaPesquisa = function () {
		var conteudoPaginaVazio = $.trim($('.unj-entity-header__summary').text()) == '';
		if (window.location.href.indexOf("show.do") > -1 && conteudoPaginaVazio) {
			var parametrosUrl = buscaParametrosUrl();
			if (parametrosUrl["referencia.codigo"] && parametrosUrl["referencia.foro"]) {
				parametrosUrl["processo.codigo"] = parametrosUrl["referencia.codigo"];
				parametrosUrl["processo.foro"] = parametrosUrl["referencia.foro"];
				delete parametrosUrl["referencia.codigo"];
				delete parametrosUrl["referencia.foro"];
				window.location.href = "show.do?" + jQuery.param(parametrosUrl)
			} else {
				window.location.href = 'open.do';
			}
		}
	};

	function buscaParametrosUrl() {
		var parametros = {};
		window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, chave, valor) {
			parametros[chave] = valor;
		});
		return parametros;
	}

	var mostrarPopupSenhaProcesso = function() {
		// remove elemento com mensagem de validacao da senha se altura do popup diminuiu. Se não existia mensagem de validação nada vai acontecer
		if($.saj.acessoRecurso.popupSenha.alturaAdicionalParaMensagemValidacao == 0) {
			$('.conteudoAvisoSenhaIncorreta').remove();
		}
		
		$.saj.popupModal($('#popupSenha'), {
			mostrarBotaoFechar:false,
			titulo: $.saj.acessoRecurso.popupSenha.titulo,
			altura: $.saj.acessoRecurso.popupSenha.altura + $.saj.acessoRecurso.popupSenha.alturaAdicionalParaMensagemValidacao,
			largura: $.saj.acessoRecurso.popupSenha.largura,
			antesDeMostrarPopup: function() {
				ajustarAcessibilidadeModalSenha();
		    },
		    onBeforeClosePopupModal: function() {
		    	$('.div-conteudo').attr('aria-hidden','false');
		    	$('#linkPasta').focus();
			}
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

	var converterQuebraDeLinhaParaTagBR = function() {
		$( 'table[id$="Movimentacoes"] tr span' ).each(function() {
			var textoQuebraDeLinhaConvertida = $.trim($(this).html()).replace(/\n/gm, '<br />');
			$(this).html(textoQuebraDeLinhaConvertida);
		});
	};
	
	$.saj.openModalCdas = function(elemento){
		$.saj.popupModal($('#popupCdas'), {
			mostrarBotaoFechar:true,
			titulo: 'CDAs',
			altura: 266,
			largura: 700,
			antesDeMostrarPopup: function() {
				$('.div-conteudo').attr('aria-hidden','true');
				$('#popupModalDiv').attr('role','document');
				$('#popupModalBotaoFechar').focus();
		    },
		    onBeforeClosePopupModal: function() {
		    	$('.div-conteudo').attr('aria-hidden','false');
			}
		});
	};
	
	$(function() {
		prepararLinksAcessoAosAutos();
		prepararBotaoFecharPopupSenha();
		exibirPopupSenhaSeNecessario();
		converterQuebraDeLinhaParaTagBR();
	});
})(jQuery);
