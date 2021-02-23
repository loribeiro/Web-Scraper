(function($) {
	$.fn.registrarComboPesquisa = function(options) {
		options.selectCbPesquisa = this;
		options.camposDePesquisa = $('#NUMPROC, #NMPARTE, #DOCPARTE, #NMADVOGADO, #NUMOAB, #PRECATORIA, #DOCDELEG');
		this.bind('change', function() {
			substituirCampoDePesquisa(options, false);
		});
		if(options.callbackPrepararCampos) {
			options.callbackPrepararCampos(options.camposDePesquisa);
		}
		
		if($.saj.numeroProcesso) {
			$.saj.numeroProcesso.afterChangeTipoNumero = function() {
				// precisa ver ainda se campo numero processo ta selecionado e desabilitar denovo
				if(options.selectCbPesquisa.val() != 'NUMPROC') {
					definirVisibilidadeCampoPesquisa(false, $('#NUMPROC'), true);
				}
			};		
		}
		
		
		substituirCampoDePesquisa(options, true);
	};
	
	var substituirCampoDePesquisa = function(options, limparInputsOcultos) {
		var $campoASerOmitido = options.camposDePesquisa.filter(':not(tr#'+ options.selectCbPesquisa.val() + ',li#' + options.selectCbPesquisa.val() + ')');
		definirVisibilidadeCampoPesquisa(false, $campoASerOmitido, limparInputsOcultos);
		var $campoASerMostrado = options.camposDePesquisa.filter('#' + options.selectCbPesquisa.val());
		definirVisibilidadeCampoPesquisa(true, $campoASerMostrado, limparInputsOcultos);
		if(options.callbackSubstituicaoCampo) {
			options.callbackSubstituicaoCampo($campoASerOmitido, $campoASerMostrado);
		}
	};
	
	var definirVisibilidadeCampoPesquisa = function(exibir, $campoPesquisaCorrente, limparOculto) {
		// todos os inputs da linha menos input com JTR (se existir)
		var $input = $('input:not(#JTRNumeroUnificado)', $campoPesquisaCorrente);
		if(exibir) {
			$campoPesquisaCorrente.show();
			$input.removeAttr('disabled');
			$input.removeAttr('readonly');
			$input.removeClass('disabled');
		} else {
			$campoPesquisaCorrente.hide();
			$input.attr('disabled', true);
			if(limparOculto) {
				$input.filter(':text').val('');
				$input.filter(':checkbox').prop('checked', false);
			}
		}
	};
})(jQuery);
