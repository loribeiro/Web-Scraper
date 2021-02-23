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
				largura:480,
				titulo: 'Senha processo',
				criarBarraDeRolagem : false,
				onUnblock: function() {
					getModalPopupSenha().hide();
				},
				antesDeMostrarPopup: function() {
					ajustarAcessibilidadeModalSenha();
			    },
			    onBeforeClosePopupModal: function() {
			    	$('.div-conteudo').attr('aria-hidden','false');
				}
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
	}
	
	var focusPrimeiraMsgModalSenha = function(){
		var msgErro = $('.msgErroSenha');
		if(msgErro.is(':visible')){
			msgErro.focus();
		} else {
			$('.orientacao121').focus();
		}	
	}
	
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
				$('#popupModalDiv').parent().css('height','310px');
				definirMensagemErroSenha(arguments[0].responseText);
				$('#conteudoAvisoSenhaIncorreta').show();
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

	var bindBotoesDoModal = function() {
		$('#botaoEnviarSenha').click(validarSenhaProcesso); 
		$('#botaoFecharPopupSenha').click(function(){
			$.saj.closePopupModal();
		});
	};
	
	var getModalPopupSenha = function() {
		return $('#popupSenhaProcesso');		
	}
	
	
	
})(jQuery);
