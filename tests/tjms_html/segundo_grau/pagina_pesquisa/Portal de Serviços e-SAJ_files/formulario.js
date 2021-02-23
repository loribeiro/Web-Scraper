(function($) {
	var definirVisibilidadeRadioUnificado = function($campoASerOmitido, $campoASerMostrado) {
		var $radioTipoNumero = $campoASerMostrado.siblings('tr:has(input:radio):first');
		if($campoASerMostrado.is('#NUMPROC')) {
			$radioTipoNumero.show();
		} else {
			$radioTipoNumero.hide();
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

		// radio nuUnificado
		var $radiosTipoNumero = $('#radioTipoNumero input:radio');
		if($radiosTipoNumero.size() > 0) {
			$radiosTipoNumero.bind('click', function() {
				substituirInputTipoNumero($(this));
			});
			// se nao tiver nenhum checado checa o primeiro
			var $radioTipoNumeroSelecionado = $radiosTipoNumero.filter(':checked');
			if($radioTipoNumeroSelecionado.size() == 0) {
				$radioTipoNumeroSelecionado = $($radiosTipoNumero[0]);
				$radioTipoNumeroSelecionado.prop('checked', 'checked');
			}
			substituirInputTipoNumero($radioTipoNumeroSelecionado);
		}
		$('#formConsulta').removeAttr('onsubmit');

		$(document).submit(function () {
			if (!$('#nuProcessoUnificadoFormatado').val()) {
				$('#numeroDigitoAnoUnificado:visible').blur();
			}
		})

	});

})(jQuery);
