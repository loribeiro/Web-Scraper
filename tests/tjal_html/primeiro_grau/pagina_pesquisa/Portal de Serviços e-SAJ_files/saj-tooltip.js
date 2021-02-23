(function($){

	//Verifica se a String passada como par�mero � nula ou vazia.
	var isBlank = function(valor){
		return valor == null || $.trim("" + valor) == '';
	};
	 
	var limparAtributosVazios = function(options) {
		if (isBlank(options.posicaoTooltip)){
			options.posicaoTooltip = 'direita';
		}
		if (isBlank(options.localImagensTooltip)) {
			options.localImagensTooltip = undefined;
		}
		if (isBlank(options.urlConteudoTooltip)) {
			options.urlConteudoTooltip = undefined;
		}
		if (isBlank(options.offsetHorizontalExtra)) {
			options.offsetHorizontalExtra = 10;
		}
		if (isBlank(options.offsetVerticalExtra)) {
			options.offsetVerticalExtra = 10;
		}
	};
	
	// bind para ocultar todos os tooltips no resize do window
	$(function() {
		$(window).bind('resize', ocultarTodosOsTooltips);
	});
	
	$.fn.registrarTooltip = function (options) {
		limparAtributosVazios(options);
		if(options.posicaoTooltip === 'esquerda') {
			// se posicaoTooltip e esquerda redefine offsetHorizontalExtra default para negativo
			defaultOptions.offsetHorizontalExtra *= -1;
		}
		
		options = $.extend({}, defaultOptions, options||{});		
		options.ajax = !isBlank(options.urlConteudoTooltip) || options.urlConteudoTooltipCallback != null;
		
		this.each(function() {
			var $currentObj = obterElementoDeComponente($(this));
			
			var dataHolder = {options: options, objReferenciaPosicaoTooltip: $currentObj, divContainerTooltip: null, divSetaTooltip: null};
			
			if(options.objReferenciaPosicaoTooltip != null) {
				dataHolder.objReferenciaPosicaoTooltip = options.objReferenciaPosicaoTooltip;
			}
			
			var showEvent = 'focus';
			var hideEvent = 'blur';
			
			if($currentObj.is(':button,:submit,:reset') || !$currentObj.is(':input')) {
				showEvent = 'mouseover';
				hideEvent = 'mouseout';
			}
			$currentObj.bind(showEvent, function(e){abrirTooltip(e, dataHolder)} );
			$currentObj.bind(hideEvent, function(e){ocultarTodosOsTooltips(e, dataHolder)} );
		});
	};
	
	var defaultOptions = {
		objReferenciaPosicaoTooltip: null,
		posicaoTooltip: 'direita',
		localImagensTooltip: 'imagens/saj',
		offsetHorizontalExtra: 10,
		offsetVerticalExtra: 10,
		urlConteudoTooltip: null,
		conteudoTooltip: null,
		mostrarConteudoKey: false,
		// callbacks para obter conteudo ou url dinamicamente
		conteudoTooltipCallback: null,
		urlConteudoTooltipCallback: null,
		ajax: false,
		conteudoContainerId: ''
	};
	
	// verifica se input eh input select ou tree select
	var obterElementoDeComponente = function($obj) {
		if($.saj && $.saj.tree && $.saj.tree.isTreeSelect($obj)) {
			// obtem input de inser��o do texto
			return $('input[name$=".text"]', $obj);
		} else if($obj.is('[input-select]')) {
			return $('input:not(:hidden):last', $obj);
		}
		return $obj;
	};
	
	var abrirTooltip = function(event, data) {
		if(!mostrarTooltip(event, data)) {
			criarTooltip(data);
			popularPosicionarTooltip(event, data);
			abrirTooltip(event, data);
		}		
	};
	
	var criarTooltip = function(data) {
		
		//var $objReferenciaPosicaoTooltip = data.objReferenciaPosicaoTooltip;
		var $body = $('body');
		
		data.divContainerTooltip = $('<div/>');
		data.divContainerTooltip.addClass('sajTooltip');
		data.divContainerTooltip.css({				
			'border': '1px solid #db8d30',
			'background-color': '#fff7b2',
			'position': 'absolute',
			'padding': '5px',
			'display': 'none'			
		});
		data.divContainerTooltip.attr('nowrap', 'nowrap');
		$body.append(data.divContainerTooltip);
		//$objReferenciaPosicaoTooltip.after(data.divContainerTooltip);
		
		var widthSeta = '5px';
		var heightSeta = '9px';
		var arquivoImagemSetaTooltip;			
		if(data.options.posicaoTooltip === 'direita') {
			arquivoImagemSetaTooltip = '/setaTooltipEsquerda.gif';
		} else if(data.options.posicaoTooltip === 'esquerda') {
			arquivoImagemSetaTooltip = '/setaTooltipDireita.gif';		
		} else if(data.options.posicaoTooltip === 'abaixo') {
			arquivoImagemSetaTooltip = '/setaTooltipCima.gif';
			widthSeta = '9px';
			heightSeta = '5px';
		}
		
		data.divSetaTooltip = $('<div/>');
		data.divSetaTooltip.addClass('sajTooltipSeta');
		data.divSetaTooltip.css({
			'width': widthSeta,
			'height': heightSeta,
			'position': 'absolute',
			'background-repeat': 'no-repeat',
			'background-image': 'url(' + data.options.localImagensTooltip + arquivoImagemSetaTooltip + ')',
			'display': 'none'
		});
		$body.append(data.divSetaTooltip);
		//$objReferenciaPosicaoTooltip.after(data.divSetaTooltip);
	};
	
	/**
	 * Processo de posicionamento do tooltip s� dever� ser efetuado ap�s carregamento do conte�do
	 */
	var popularPosicionarTooltip = function(event, data) {
		if(data.options.ajax) {
			var urlConteudoTooltip = data.options.urlConteudoTooltip;
			if(data.options.urlConteudoTooltipCallback != null) {
				urlConteudoTooltip = data.options.urlConteudoTooltipCallback(event, data);
			}
			data.divContainerTooltip.load(urlConteudoTooltip, function(){
				posicionarTooltip(data);
			});
		} else if (data.options.mostrarConteudoKey) {				
			var containerId = data.options.conteudoContainerId;
			var conteudoToolTip = $(document.getElementById(containerId));
			data.divContainerTooltip.html(conteudoToolTip);
			posicionarTooltip(data);
		} else {
			var conteudoTooltip = data.options.conteudoTooltip;
			if(data.options.conteudoTooltipCallback != null) {
				conteudoTooltip = data.options.conteudoTooltipCallback(event, data);
			}
			data.divContainerTooltip.html(conteudoTooltip);
			posicionarTooltip(data);
		}			
	};
	
	var posicionarTooltip = function(data) {
		var $objReferenciaPosicaoTooltip = data.objReferenciaPosicaoTooltip;
		var offset = $objReferenciaPosicaoTooltip.offset();
		
		var topContainer = offset.top;
		var topSeta = topContainer;
		var leftContainer = offset.left;
		var leftSeta = leftContainer;
		
		if(data.options.posicaoTooltip === 'direita') {
			var leftExtra = $objReferenciaPosicaoTooltip.width() + data.options.offsetHorizontalExtra;
			leftSeta += leftExtra;
			// -2 para tirar mais ou menos metade do height da imagem da seta
			topSeta += $objReferenciaPosicaoTooltip.height()/2 - 2;
			// +5 pra contabilizar o width da imagem da seta
			leftContainer += leftExtra + 5;
		} else if(data.options.posicaoTooltip === 'abaixo') {
			var topExtra = data.options.offsetVerticalExtra + $objReferenciaPosicaoTooltip.height();
			topSeta += topExtra;
			// +5 pra contabilizar o height da imagem da seta
			topContainer += topExtra + 5;
			// -4 pra contabilizar o width da imagem da seta
			leftSeta += $objReferenciaPosicaoTooltip.width()/2 - 4;
		} else if(data.options.posicaoTooltip === 'esquerda') {
			// -2 para tirar mais ou menos metade do height da imagem da seta
			topSeta += $objReferenciaPosicaoTooltip.height()/2 - 2;
			leftSeta += data.options.offsetHorizontalExtra;
			// +12 para contabilizar width da imagem
			leftContainer += data.options.offsetHorizontalExtra - (data.divContainerTooltip.width() + 12);
		}
		
		data.divContainerTooltip.css({				
			'top': topContainer,
			'left': leftContainer
		});
		
		data.divSetaTooltip.css({
			'top': topSeta,
			'left': leftSeta
		});
		
	};
	
	var mostrarTooltip = function(event, data){
		ocultarTodosOsTooltips();
		if(data.divContainerTooltip != null && data.divSetaTooltip != null) {
			data.divContainerTooltip.fadeIn();
			data.divSetaTooltip.fadeIn();
			return true;
		}
		return false;
	};	
	
	var ocultarTodosOsTooltips = function(event) {
		$('div.sajTooltip,div.sajTooltipSeta').hide();
	};
	
})(jQuery);