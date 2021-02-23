(function($){
	
	$.saj = $.saj || {};
	$.saj.acessibilidade = $.saj.acessibilidade || {};
	
	$(function() {
		$.saj.acessibilidade.lerMensagemErroESucesso();
		$.saj.acessibilidade.focarPrimeiroCampoTela();
	});
	
	// Para utilizar essa função corretamente é necessário atualizar o saj-spw.
	$.saj.acessibilidade.lerMensagemErroESucesso = function(){
		if(contemMensagemRetornoAoUsuario()){
			window.setTimeout(function() {
				$('#mensagemRetorno').focus();
			}, 1000);
		}
	};
		
	$.saj.acessibilidade.focarPrimeiroCampoTela = function(){
		if(contemMensagemRetornoAoUsuario()){
			return;
		}
		window.setTimeout(function() { $('form:first *:input[type!=hidden]:visible:enabled:first').focus(); }, 10);
	};
	
	var contemMensagemRetornoAoUsuario = function(){
		var contemMensagemErro = $('img[src$="icoError.gif"]:visible').length > 0;
		var contemMensagemSucesso = $('img[src$="icoConfirm.gif"]:visible').length > 0;
		var contemMensagemAtencao = $('img[src$="icoAlert.gif"]:visible').length > 0;
		if(contemMensagemErro || contemMensagemSucesso || contemMensagemAtencao){
			return true;
		}
		return false;
	}
	
	$.saj.acessibilidade.contemMensagemRetornoAoUsuario = contemMensagemRetornoAoUsuario;
	
})(jQuery);