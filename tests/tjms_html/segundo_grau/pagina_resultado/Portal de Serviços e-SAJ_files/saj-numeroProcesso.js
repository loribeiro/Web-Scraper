/************************************************************************************** 
  * saj-numeroProcesso.js
  * 
  * javascripts utilizados na tag nuProcessoUnificado
  *************************************************************************************/

(function($) {
	
	$.saj = $.saj || {};
	$.saj.numeroProcesso =  $.numeroProcesso || {};
	$.saj.numeroProcesso.desabilitarNumeroOculto = true;
	
	$.saj.bindCamposNumeroProcesso = function(complementoId) {
		if(!complementoId){
			complementoId = '';
		}
		bindOnChangeNuProcesso(complementoId);
		bindOnChangeNuProcessoAntigo(complementoId);
		bindRadios(complementoId);
		selecionarRadioDefault(complementoId);
		atualizarCamposRenderizados(complementoId);
		focarCampoAnterior(complementoId);
		ajustarCampoNuProcessoAntigo(complementoId);
	};
	
	var onChangeNumeroProcesso = function(complementoId) {
		var campoNumeroDigitoAnoUnificado = $.trim($('#numeroDigitoAnoUnificado'+complementoId).val());
		var campoJTRNumeroUnificado = $.trim($('#JTRNumeroUnificado'+complementoId).val());
		var campoForoNumeroUnificado = $.trim($('#foroNumeroUnificado'+complementoId).val());	
		var $campoHidden = $('#nuProcessoUnificadoFormatado'+complementoId);
		
		if (campoJTRNumeroUnificado.split('.').length === 1) {
			campoJTRNumeroUnificado = campoJTRNumeroUnificado.substring(0,1) + '.' + campoJTRNumeroUnificado.substring(1);
		}
		
		if (campoNumeroDigitoAnoUnificado != '' && campoForoNumeroUnificado != '') {
			var campoForoFormatado = campoForoNumeroUnificado;
			var nuProcessoUnificadoFormatado = campoNumeroDigitoAnoUnificado + '.' + campoJTRNumeroUnificado + '.' + campoForoFormatado;
			if ($campoHidden.val() != nuProcessoUnificadoFormatado) {
				$('#nuProcessoAntigoFormatado'+complementoId).val('');				
				$campoHidden.val(nuProcessoUnificadoFormatado);
			}
		} else if (campoNumeroDigitoAnoUnificado != '' || campoForoNumeroUnificado != '') {
			if ($campoHidden.val() != '') {
				$('#nuProcessoAntigoFormatado'+complementoId).val('');				
				$campoHidden.val('');
				$campoHidden.change();
			}
		}
		if (typeof $.saj.numeroProcesso.afterChangeNumeroProcessoUnificado == 'function') {
			$.saj.numeroProcesso.afterChangeNumeroProcessoUnificado();
		}
		$campoHidden.change();
	};
	
	var onChangeNumeroProcessoAntigo = function(complementoId) {
		//limpaNumeroUnificado
		$('#nuProcessoUnificadoFormatado'+complementoId).val('');
		$('#numeroDigitoAnoUnificado'+complementoId).val('');
		$('#foroNumeroUnificado'+complementoId).val('');
	};
	
	var bindOnChangeNuProcesso = function(complementoId) {
		$('#numeroDigitoAnoUnificado'+complementoId).bind('blur', function(){onChangeNumeroProcesso(complementoId)});
		$('#foroNumeroUnificado'+complementoId).bind('blur', function(){onChangeNumeroProcesso(complementoId)});
	};
	
	var bindOnChangeNuProcessoAntigo = function(complementoId) {
		$('#nuProcessoAntigoFormatado'+complementoId).bind('blur', function(){onChangeNumeroProcessoAntigo(complementoId)});
	};
	
	var bindRadios = function(complementoId) {
		$('#radioNumeroUnificado'+complementoId).click(function(){onClickRadioNumeroUnificado(complementoId)});
		$('#radioNumeroAntigo'+complementoId).click(function(){onClickRadioNumeroAntigo(complementoId)});
	};

	var selecionarRadioDefault = function(complementoId) {
		var $radioChecado = $('#radioNumeroUnificado'+complementoId+':checked,#radioNumeroAntigo'+complementoId+':checked');
		if(!$radioChecado[0] && $('#radioNumeroUnificado'+complementoId)[0]) {
			$('#radioNumeroUnificado'+complementoId)[0].checked = true;
		}
	};	

	var atualizarCamposRenderizados = function(complementoId) {
		var $radioChecado = $('#radioNumeroUnificado'+complementoId+':checked,#radioNumeroAntigo'+complementoId+':checked');
		$radioChecado.click();
	};
	
	focarCampoAnterior = function(complementoId){
		$('#numeroDigitoAnoUnificado'+complementoId).bind('keydown', function(e){
			if(e.shiftKey && e.keyCode == 9) {
				var generico = $('input:visible');
			    var indice = generico.index(e.target) - 1;
			    var seletor = $(generico[indice]);			    
			    if (seletor.length === 0) {
			    	window.setTimeout(function() {
			    		e.target.focus();
					}, 10);
			    } else {
			    	window.setTimeout(function() {
						$(generico[indice]).focus();
					}, 10);
			    }
			}
		});
	};

	var onClickRadioNumeroUnificado = function(complementoId) {
		$('#linhaProcessoAntigo'+complementoId).hide();
		$('#linhaProcessoUnificado'+complementoId).show();
		$('#nuProcessoAntigoFormatado'+complementoId).attr('disabled', $.saj.numeroProcesso.desabilitarNumeroOculto);
		$('#nuProcessoUnificadoFormatado'+complementoId).attr('disabled', false);
		$('#numeroDigitoAnoUnificado'+complementoId).attr('disabled', false).removeClass('disabled');
		$('#foroNumeroUnificado'+complementoId).attr('disabled', false).removeClass('disabled');
		if(typeof $.saj.numeroProcesso.afterChangeTipoNumero == 'function'){
			$.saj.numeroProcesso.afterChangeTipoNumero(this);
		}
	};

	var onClickRadioNumeroAntigo = function(complementoId) {
		$('#linhaProcessoUnificado'+complementoId).hide();
		$('#linhaProcessoAntigo'+complementoId).show();
		var nuProcessoAntigoFormatado = $('#nuProcessoAntigoFormatado'+complementoId);
		nuProcessoAntigoFormatado.attr('disabled', false);
		nuProcessoAntigoFormatado.removeClass('disabled');
		$('#nuProcessoUnificadoFormatado'+complementoId).attr('disabled', $.saj.numeroProcesso.desabilitarNumeroOculto);
		$('#numeroDigitoAnoUnificado'+complementoId).attr('disabled', $.saj.numeroProcesso.desabilitarNumeroOculto);
		$('#foroNumeroUnificado'+complementoId).attr('disabled', $.saj.numeroProcesso.desabilitarNumeroOculto);
		if(typeof $.saj.numeroProcesso.afterChangeTipoNumero == 'function'){
			$.saj.numeroProcesso.afterChangeTipoNumero();
		}
	};
	
	var isNumeroUnificadoSelecionado = function() {
		return $('#radioNumeroUnificado'+complementoId)[0].checked;
	};
	
	var isNumeroAntigoSelecionado = function() {
		return $('#radioNumeroAntigo'+complementoId)[0].checked;
	};
	
	var ajustarCampoNuProcessoAntigo = function(complementoId){
		var nuAntigo = $('#nuProcessoAntigoFormatado' + complementoId);
		var linhaNuProcesso = $('#linhaProcessoUnificado').parents('tr[class=""]');
		nuAntigo.attr('aria-label','Número do processo');
		if(linhaNuProcesso.find('span.sinal_obrigatorio').length){
			linhaNuProcesso.find('input').not('[type="hidden"]').not(':disabled').attr('aria-required', 'true').attr('required','true');
		}
	}
	
	// Funções públicas
	$.saj.numeroProcesso.isNumeroUnificadoSelecionado = isNumeroUnificadoSelecionado;
	$.saj.numeroProcesso.isNumeroAntigoSelecionado = isNumeroAntigoSelecionado;

})(jQuery);
