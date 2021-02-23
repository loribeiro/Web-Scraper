(function($) {
	var definirVisibilidadeRadioUnificado = function($campoASerOmitido, $campoASerMostrado) {
		var $radioTipoNumero = $campoASerMostrado.siblings('tr:has(input:radio):first');
		if ($campoASerMostrado.is('#NUMPROC')) {
			$radioTipoNumero.show();
		}
		$radioTipoNumero.hide();
    };

	var ajustarRadioNumeroProcesso = function(){
		var $radiosTipoNumero = $('#radioNumeroUnificado,#radioNumeroAntigo');
		if($radiosTipoNumero.size() === 0 || !$radiosTipoNumero.is(':visible')) {
			return;
		}
		// se nao tiver nenhum checado checa o primeiro
		var $radioTipoNumeroSelecionado = $radiosTipoNumero.filter(':checked');
		if($radioTipoNumeroSelecionado.size() == 0) {
			$radioTipoNumeroSelecionado = $($radiosTipoNumero[0]);
			$radioTipoNumeroSelecionado.prop('checked', 'checked');
		}
	};
	
	$(function() {
		// opcoesMobile
		var $divOpcaoMobile = $('div#divOpcaoVisualizarMobile:hidden');
		var alturaBrowser = $(window).height();
		var larguraBrowser = $(window).width();
		if($divOpcaoMobile.size > 0 && alturaBrowser < 800 && larguraBrowser < 600 ){
			$divOpcaoMobile.show();
		}
		
		// combo pesquisa
 		$('select[name$="cbPesquisa"]').registrarComboPesquisa({
			callbackSubstituicaoCampo: definirVisibilidadeRadioUnificado
		});

		$('#numeroDigitoAnoUnificado,#foroNumeroUnificado,#nuProcessoAntigoFormatado').focus(function () {
			ajustarRadioNumeroProcesso();
		});

		$('#formConsulta').removeAttr('onsubmit');

		//Remove markup desnecessario do spw
        var tbMensagem = $('#spwTabelaMensagem .tabelaMensagem');
		if(tbMensagem.size() === 2) {
            var spwMarkup = tbMensagem.filter(':eq(1)');
            if(spwMarkup.text().trim().length === 0) {
            	spwMarkup.remove();
			}
		}

		$(document).submit(function () {
			if (!$('#nuProcessoUnificadoFormatado').val()) {
				$('#numeroDigitoAnoUnificado:visible').blur();
			}
		})

	});

})(jQuery);

	


