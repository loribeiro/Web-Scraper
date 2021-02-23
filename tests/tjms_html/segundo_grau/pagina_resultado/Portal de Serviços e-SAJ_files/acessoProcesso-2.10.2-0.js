(function($) {	
	
	var KEY_CODE = {
			ENTER : 13,
			ESC: 27
	};
		       
	var fecharModalDeSenha = function() {
		$.saj.closePopupModal();
	};
	
	$(function() {		
		var $htmlPopupSenhaProcesso = getModalPopupSenha();
		if ($htmlPopupSenhaProcesso.length) {
			$(document).keyup(function(evento){
				if (evento.which == KEY_CODE.ENTER) {
					$('#botaoEnviarSenha').click();
				}
				if(evento.which == KEY_CODE.ESC) {
					fecharModalDeSenha();
				}
			});
			bindBotoesDoModal();
			$.saj.popupModal($htmlPopupSenhaProcesso, {
				altura:230,
				largura:580,
				titulo: 'Senha do processo',
				criarBarraDeRolagem : false,
				onUnblock: function() {
					getModalPopupSenha().hide();
				},
				antesDeMostrarPopup: function() {
					ajustarAcessibilidadeModalSenha();
			    },
			    onBeforeClosePopupModal: function() {
			    	$('.div-conteudo').attr('aria-hidden','false');
				},
                mostrarBotaoFechar: false
			});		
		}
	});
	
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
	};
	
	var focusPrimeiraMsgModalSenha = function(){
		var msgErro = $('.msgErroSenha');
		if(msgErro.is(':visible')){
			msgErro.focus();
		} else {
			$('.orientacao121').focus();
		}	
	};
	
	var validarSenhaProcesso = function() {
		$.ajax ({
			type: 'POST',
			url: window.saj.env.root + '/validarSenhaAcessoProcesso.do',
			data: {
				senhaDoProcessoDigitada: $('#senhaProcesso').val(),
				cdProcesso: $('input:hidden[name="cdProcesso"]').val()
			},
			success:function(cdProcesso) {
				$.saj.closePopupModal();
				window.location = window.saj.env.root + '/show.do?processo.codigo=' + cdProcesso;
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
	};

	var bindBotoesDoModal = function() {
		$('#botaoEnviarSenha').click(validarSenhaProcesso); 
		$('#botaoFecharPopupSenha').click(function(){
            verificaSeDeveRedirecionaParaPesquisa();
			$.saj.closePopupModal();
		});
	};
	
	var getModalPopupSenha = function() {
		return $('#popupSenhaProcesso');		
	}

    /**
     * Quando consultado um processo em segredo de justiça ao clicar em fechar a modal, deve redirecionar para o
     * formulário de pesquisa, isso evita que ao fechar a modal sem informar a senha os dados não sejam carregados
     */
    var verificaSeDeveRedirecionaParaPesquisa = function () {
        var conteudoPaginaVazio = $.trim($('.unj-entity-header__summary').text()) == '';
        if ((window.location.href.indexOf("show.do") > -1 || window.location.href.indexOf("search.do") > -1) && conteudoPaginaVazio) {
            window.location.href = 'open.do';
            return;
        }
    };



})(jQuery);
