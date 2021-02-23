(function($) {
	$(function() {
		
		var callbackPrepararCampos = prepararTooltipCampos;
		// combo pesquisa
 		$('select[name$="cbPesquisa"]').registrarComboPesquisa({
 			callbackPrepararCampos: callbackPrepararCampos,
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
		configurarAcessibilidade();
	});
	
	var prepararTooltipCampos = function($camposDePesquisa) {
		// bind tooltips
		var baseUrlTooltip = window.saj.env.root + '/tooltip.do?cbPesquisa=';
		var baseOptions = {
				localImagensTooltip: window.saj.env.imagens + '/saj'
		};
		
		$camposDePesquisa.each(function(){
			var $linhaDePesquisa = $(this);
			var options = $.extend({}, baseOptions, {
				urlConteudoTooltip: baseUrlTooltip + $linhaDePesquisa.attr('id')
			});
			
			var $inputPesquisa = $('input[name$="dePesquisa"]', $linhaDePesquisa);
			
			// se tipo de pesquisa eh por nome, vai ter um irmao checkbox dentro do span, nesse caso ele usado como referencia para o tooltip
			var $objReferenciaPosicaoTooltip = $inputPesquisa.siblings('label');
			if($objReferenciaPosicaoTooltip.size() > 0) {
				options.objReferenciaPosicaoTooltip = $objReferenciaPosicaoTooltip;
			}
			$inputPesquisa.registrarTooltip(options);
		});
	};
	
	var definirVisibilidadeRadioUnificado = function($campoASerOmitido, $campoASerMostrado) {
		var $radioTipoNumero = $campoASerMostrado.siblings('tr:has(input:radio):first');
		if($campoASerMostrado.is('tr#NUMPROC')) {
			$radioTipoNumero.show();
		} else {
			$radioTipoNumero.hide();
		}
	};
	
	var configurarAcessibilidade = function(){
		//Acessibilidade: adiciona informação de obrigatoriedade leitores de tela
		$('input:text').attr('aria-required', true).attr('required', true);

        $('#listagemDeProcessos h2').each(function() {
			var foro = $(this);
			var textoForo = foro.text();
            foro.replaceWith('<h3 style="font-size: 13px;">' + textoForo + '</h3>');
        });
	}
		
})(jQuery);
