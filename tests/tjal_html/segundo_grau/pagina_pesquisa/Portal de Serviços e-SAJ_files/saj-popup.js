(function($) {
	$.saj = $.saj || {};
	$.saj.popup = {};

	var box;
	var movendo = false;
	var posXinicial, posYinicial;
	var posXlayer, posYlayer;
		
	$.saj.popup.show = function(options) {
		options = extendDefaultOptions(options);
		
		if(spwConsultaAberto()) {
			return;
		}
		bloquearSpwConsulta();
		
		box = $('#'+options.popupId);
		var build = !box[0];
		if (build) {
			box = construirBox(options);
		}
		
		registraEventosParaMoverDialog(options);
		
		box.show();
		if (build || options.reload) {
			load(options);
		} else if (options.onload) {
			options.onload();
		}
	};
	
	var hide = $.saj.popup.hide = function(options) {
		// Chamada do bind do close button?
		if (options.data) {
			options = options.data;
		}
		
		options = extendDefaultOptions(options);
		$('#'+options.popupId).hide();
		desregistraEventosParaMoverDialog(options);
		desbloquearSpwConsulta();
		if (options.afterClose) {
			options.afterClose();
		}
	};

	var load = $.saj.popup.load = function(options) {
		var container = $('div#'+options.popupId + ' div.popupContainer');
		if (options.url ) {
			//container.css('height', 200);
			if (options.processandoImgUrl) {
				container.html('<table width="100%" height="100%"><tbody><tr><td valign="center" align="center"><img src="'+options.processandoImgUrl+'"></td></tr></tbody></table>');
			}
			container.load(options.url, options.params, options.onload);
		} else if(options.element){
			container.replaceWith(options.element);
		}
	};
	
	var extendDefaultOptions = function(options) {
		var defaultOptions = {
			popupId: 'popupId',
			titulo: 'SAJ',
			width: 500,
			maxHeight: null,
			expectedHeight: null,
			processandoImgUrl: null,
			url: null, /** Url para efetuar o ajax do conteúdo do popup **/
			element: null, /** Conteúdo do popup. Parâmetro para não efetuar o ajax. **/
			params: null, 
			reload: false,
			onload: null,
			afterClose: null
		};
		return $.extend(defaultOptions, options);
	};
	
	var spwConsultaAberto = function() {
		return $('#spwConsulta').size() != 0;
	};

	var bloquearSpwConsulta = function() {
		var spwConsulta = $('<div>')[0];
		spwConsulta.id = 'spwConsulta';
		spwConsulta.style.display = 'none';
		document.body.appendChild(spwConsulta);
	};
	
	var desbloquearSpwConsulta = function() {
		var spwConsulta = $('#spwConsulta')[0];
	    if (spwConsulta) {
	      spwConsulta.parentNode.removeChild(spwConsulta);
	      spwConsulta = null;
	    }
	};
	
	var registraEventosParaMoverDialog = function(options) {
		$('div#'+options.popupId + ' td.tituloPopup').bind('mousedown', iniciarMover);
		$(document.body).bind('mousemove', mover).bind('mouseup', terminarMover);
	};
	
	var desregistraEventosParaMoverDialog = function(options) {
		$('div#'+options.popupId + ' td.tituloPopup').unbind('mousedown');
		$(document.body).unbind('mousemove').unbind('mouseup');
	};
	
	var iniciarMover = function(event) {
		movendo = true;
		posXinicial = new Number(event.clientX + document.body.scrollLeft);
		posYinicial = new Number(event.clientY + document.body.scrollTop);
		posXlayer = converteNumero(box[0].style.left);
		posYlayer = converteNumero(box[0].style.top);
	};
	
	var mover = function(event) {
		if (movendo) {
			var currentX = new Number(event.clientX + document.body.scrollLeft);
			var currentY = new Number(event.clientY + document.body.scrollTop);
			box[0].style.left = posXlayer + (currentX - posXinicial);
			box[0].style.top = posYlayer + (currentY - posYinicial);
		}
	};
	
	var terminarMover = function() {
		movendo = false;
	};
	
	var construirBox = function(options) {
		//pega dados da pag
		var body = document.body;
		var alturaPag = body.clientHeight;
		var larguraPag = body.clientWidth;
		var posScroll = body.scrollTop;
		
		var box = $('<div id="'+options.popupId+'">');
		box.css('position', 'absolute');
		box.css('width', options.width + 'px');
		box.css('left', (larguraPag - options.width) / 2);
		box.css('top', (alturaPag - 300) / 2 + posScroll);
		box.css('border', 'solid black 2px');
		box.css('zIndex', 99);
		box.css('display', 'none');

		//cria a tabela superior
		var table = $('<table cellpadding="0" cellspacing="0">');
		table.css('width', '100%');
 		box.append(table);
 		
		var tbody = $('<tbody>');
		table.append(tbody);

		//cria a linha da tabela
		var tr = $('<tr>');
		tbody.append(tr);

		//cria o titulo
		var titulo = $('<td class="tituloPopup">');
		titulo.css('backgroundColor', '#9B9B9B');
		titulo.css('color', '#FFFFFF');
		titulo.css('fontWeight', 'bold');
		titulo.css('fontFamily', 'Verdana,Arial,Helvetica,sans-serif');
		titulo.css('fontSize', '14px');
		titulo.css('height', '18px');
		titulo.append(document.createTextNode(options.titulo));
		tr.append(titulo);

		//cria o closebox
		var closeTd = $('<td>');
		closeTd.css('width', '20px');
		closeTd.css('backgroundColor', '#9B9B9B');
		tr.append(closeTd);

		var closeButton = $('<button class="spwBotaoGrid">');
		closeButton.bind('click', options, hide);
		
		if ($.browser.msie) {
			closeButton.val('&nbsp;X&nbsp;');
		} else {
			closeButton.append(document.createTextNode('X'));
			closeButton.css('width', '100%');
			closeButton.css('height', '100%');
			closeButton.attr('type', 'button');
		}
		closeTd.append(closeButton);
		
		//cria o TR cinza abaixo do tï¿½tulo
		tr = $('<tr>');
		tbody.append(tr);
		
		var td = $('<td>&nbsp;</td>');
		td.css('backgroundColor', '#CCC');
		td.css('height', '18px');
		tr.append(td);
		
		var td = $('<td>&nbsp;</td>');
		td.css('backgroundColor', '#CCC');
		tr.append(td);
		
		//cria o container
		var dialogContainer = $('<div class="popupContainer">');
		dialogContainer.css('width', '100%');
		dialogContainer.css('backgroundColor', '#FFFFFF');
		if (options.maxHeight) {
			dialogContainer.css('height', options.maxHeight);
			dialogContainer.css('overflow', 'auto');
		}
		box.append(dialogContainer);

		//centraliza box
		var height = options.expectedHeight || options.maxHeight;
		if (!height) {
			height = 200;
		}
		var body = document.body;
		var alturaPag = body.clientHeight;
		var larguraPag = body.clientWidth;
		var posScroll = body.scrollTop;
		box.css('left', (larguraPag - options.width) / 2);
		box.css('top', (alturaPag - height) / 2 + posScroll);
		
		box.appendTo(body);
		
		return box;
	};
	
})(jQuery);
