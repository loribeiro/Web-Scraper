 /**************************************************************************************
  * saj-popup-modal.js
  * versao: 1.0.0-0
  * autor: Fernando Pereira
  *************************************************************************************/
(function($) {

	$.saj = $.saj || {};

/*** Métodos disponíveis para acesso externo ***/
	$.saj.popupModal = function(textoHtml, options) { popupModal(textoHtml, options); };
	$.saj.popupModalAjax = function(url, options) { popupModalAjax(url, options); };
    $.saj.closePopupModal = function() {
        // metodo padrao nao faz nada, para nao causar erros em chamadas ocorridas antes de abrir algum popup modal
    };

	var bindEscFechamentoPopupModal = function(sajOpts){
		var ESC_CODE = 27;
		var $document = $(document)
		$document.unbind('keydown.fecharModal');
		$document.bind('keydown.fecharModal', function(e){
			if(e.keyCode == ESC_CODE){
				eventoFechandoBotaoSemAcao(sajOpts);
				$.saj.closePopupModal();
			}
		});
	};

	var onClose = function(el, opts, data){
		recuperarElemento(el, opts);
		$.event.trigger({
			type: "fechandoModal",
			message: opts
		})
		opts.onPopupModalClose(opts, data);
	};

	var recuperarElemento = function(el, opts){
		var data = $(el).data('saj-popup-modal.history');
		if (data && data.el) {
			data.el.style.display = data.display;
	        data.el.style.position = data.position;
	        if (data.parent){
				data.parent.appendChild(data.el);
	        }
	        $(data.el).removeData('blockUI.history');
		}
	};


/*** Redefine os valores default de css definidos no blockUI ***/
	var defaults = {
		mostrarBotaoFechar: true,
		titulo: '',
		altura: '300',
		largura: '300',
		/** função para recuperar o elemento **/
		//onUnblock: onClose,
		/** Limita as dimensões do popup para caber na área visível da tela, caso ultrapasse **/
		ajustarParaCaberNaTela: true,
		onPopupModalClose: function(opts){},
		antesDeMostrarPopup: function(html){},
		metodo: 'GET', //apenas para o ajax
		data: {}, //apenas para o ajax
		mostrarBotaoOk: false
	};


	var blockUI_defaults = {
		focusInput: false,
		fadeIn: 300,
		fadeOut: 300
	};

	var blockUI_css = {
	    height:         '',
	    'min-height':	'',
	    'max-height':   '580px',
	    width:          '',
	    top:            '',
	    left:           '',
	    border:         '1px solid #000',
	    cursor:         'default'
	};

	var blockUI_overlayCSS = {
	    backgroundColor: '#000',
	    opacity:          0.4,
	    cursor:          'default'
	};


/*** variáveis ***/
	var popupDiv;
	var cabecalhoDiv;
	var botaoFechar;

/*** Métodos internos ***/

/*** Parâmetros default dos Métodos popupModal e popupModalAjax ***/
	var getOptions = function(options) {
		if (options == undefined) {
			options = {};
		}
		var sajOpts = $.extend({}, defaults, options);
		var css = $.extend({}, blockUI_css, options.css || {});
		if (sajOpts.altura && sajOpts.altura != '0') {
			css["min-height"] = sajOpts.altura;
		}
		if (sajOpts.largura && sajOpts.largura != '0') {
			css.width = sajOpts.largura;
		}
		var overlayCSS = $.extend({}, blockUI_overlayCSS, options.overlayCSS || {});
		var retorno = $.extend({}, blockUI_defaults);
		retorno.css = css;
		retorno.overlayCSS = overlayCSS;
		retorno.sajOpts = sajOpts;
		
		bindEscFechamentoPopupModal(sajOpts);
		
		$.saj.closePopupModal = function(data){
			if(typeof sajOpts.onBeforeClosePopupModal  === "function"){
				sajOpts.onBeforeClosePopupModal(data);
			}
			$.unblockUI(sajOpts);

			// A condição abaixo serve para corrigir um erro conhecido na hora do fechamento de modais no Internet Explorer.
			// Quando a página não possui doctype, no caso dos IEs mais antigos (ou caso de IEs mais novos em modo de compatibilidade),
			// o modal não é fechado corretamente.
			if(!$.support.boxModel) {
				$(".blockUI").fadeOut("slow");
			}
			onClose(window, sajOpts, data);
		};

		return retorno;
	};

/**
  * - popupModal
  * Mostra um popup modal contendo o resultado do html informado.
  */
	var popupModal = function(elemento, options) {
		options = getOptions(options);
		var conteudoDiv = elemento;
		if(!conteudoDiv.jquery) {
			conteudoDiv = $(document.createElement('div'));
			conteudoDiv.html(elemento);
		}
		storeElement(conteudoDiv[0]);
		var popupDiv = montaPopupDiv(conteudoDiv, options)[0];
		conteudoDiv.show();
		options.message = popupDiv;
		options.onBlock = function () {
			options.sajOpts.antesDeMostrarPopup(conteudoDiv);
		}
		$.blockUI(options);
	};


	/**
	 * Salva o elemento para ser recuperado quando fechar o popup
	 */
	var storeElement = function(node){
	    if(!node) {
	        console.error('O conteudo do popup modal informado nao existe. Essa situacao pode ocorrer quando multiplas chamadas de abertura de popup modal sao efetuadas, ou o seletor realmente nao existe');
	        return;
        }
		var el = window;
		var data = {};
        $(el).data('saj-popup-modal.history', data);
        data.el = node;
        data.parent = node.parentNode;
        if(node.style){
        	data.display = node.style.display;
        	data.position = node.style.position;
        }
		if (data.parent){
			data.parent.removeChild(node);
		}
	};

	$.saj.popupModalChangeContent = function(elemento, options){
		var $elemento = elemento.jquery ? elemento : $(elemento);
		elemento = $elemento[0];
		var $popupModalDiv = $('#popupModalDiv');
		if($popupModalDiv){
			recuperarElemento(window);
			storeElement(elemento);
			$elemento.show();
			$popupModalDiv[0].appendChild(elemento);
			if(options.focusInput){
				$elemento.find('input:first').focus();
			}
		}
	};


/**
  * - popupModalAjax
  * Mostra um popup modal contendo o resultado da requisição ajax referente à url informada.
  */
	var popupModalAjax = function(url, options){
		options = getOptions(options);
		var conteudoDiv = $('<div>');
		conteudoDiv.html('<b>Por favor, aguarde.</b>');
		conteudoDiv.addClass('modalProcessando');
		popupDiv = montaPopupDiv(conteudoDiv, options);
		options.message = popupDiv;
		$.blockUI(options);
		$.ajax({
			url: url,
			data: options.sajOpts.data,
			cache: false,
			type: options.sajOpts.metodo,
			success:function(transport) {
				conteudoDiv.removeClass('modalProcessando');
				conteudoDiv.html(transport);
				options.sajOpts.antesDeMostrarPopup(transport)
			},
			error:function() {
				conteudoDiv.removeClass('modalProcessando');
				conteudoDiv.html('<b>Não foi possível carregar a página.</b>');
			},
			complete: function() {

			}
		});
	};

	var montaPopupDiv = function(conteudoDiv, options) {
		conteudoDiv.addClass('modalConteudo');
		popupDiv = $('<div id="popupModalDiv" class="popup-modal-div-all" role="dialog" aria-label="'+options.sajOpts.titulo+'">');
		popupDiv.addClass = 'modalDiv';

		var body = document.body;
		var windowSize = getWindowSize();
		var alturaPag = windowSize.height;
		var larguraPag = windowSize.width;

		var alturaPrevista = intProperty(options.sajOpts.alturaPrevista || options.height || 300);
		var height = intProperty(options.css.height);
		var width = intProperty(options.css.width);

		//Limita as dimensões do popup para caber na área visível da tela, caso ultrapasse
		if (options.sajOpts.ajustarParaCaberNaTela) {
			if (alturaPrevista && alturaPrevista > alturaPag - 50) {
				alturaPrevista = alturaPag - 50;
			}
			if (height && height > alturaPag - 50) {
				options.css.height = '' + (alturaPag - 50);
			}
			if (width && width > larguraPag - 50) {
				options.css.width = '' + (larguraPag - 50);
			}
		}

		//define a posição e tamanho do popup
		options.css.top = (alturaPag - alturaPrevista) / 2;
		options.css.left = (larguraPag - width) / 2;

		var cabecalhoDiv = montaCabecalhoDiv(options);
		popupDiv.append(cabecalhoDiv);
		popupDiv.append(conteudoDiv);

		if (options.sajOpts.mostrarBotaoOk) {
			var rodape = montaRodapeDiv(options);
			popupDiv.append(rodape);
		}
		return popupDiv;
	};

	var intProperty = function(value) {
		if (typeof value == 'string') {
			return parseInt(value);
		}
		return value;
	};

	var montaCabecalhoDiv = function(options) {
		cabecalhoDiv = $('<div>');
		//cria a tabela superior
		var table = $('<table cellpadding="0" cellspacing="0">');
		cabecalhoDiv.append(table);
		table.css('width', options.css.width);
		var tbody = $('<tbody>');
		table.append(tbody);

		//cria a linha da tabela
		var tr = $('<tr>');
		tbody.append(tr);

		//cria o titulo
		var tdTitulo = $('<td>');
		tdTitulo.addClass('modalTitulo');
		tdTitulo.append(document.createTextNode(options.sajOpts.titulo));
		tr.append(tdTitulo);

		//cria o botão fechar
		var closeTd = $('<td>');
		closeTd.css('width', '20px');
		closeTd.css('backgroundColor', '#9B9B9B');
		tr.append(closeTd);
		botaoFechar = $('<button type="button" id="popupModalBotaoFechar" class="modalBotaoFechar " aria-label="fechar" tabindex="-1">');
		botaoFechar.bind('click', null, function() {
			eventoFechandoBotaoSemAcao(options.sajOpts);
			$.saj.closePopupModal();
		});		
		botaoFechar.append(document.createTextNode('X'));
		
		botaoFechar.css('width', '100%');
		botaoFechar.css('height', '100%');
		closeTd.append(botaoFechar);

		if (!options.sajOpts.mostrarBotaoFechar) {
			esconderBotaoFechar();
		}


		//cria o TR cinza abaixo do titulo
		tr = $('<tr aria-hidden="true">');
		tbody.append(tr);

		var td = $('<td>&nbsp;</td>');
		td.css('backgroundColor', '#CCC');
		td.css('height', '18px');
		tr.append(td);

		var td = $('<td>&nbsp;</td>');
		td.css('backgroundColor', '#CCC');
		tr.append(td);

		return cabecalhoDiv;
	};

	var montaConteudoDiv = function(conteudo) {
		var conteudoDiv = $('<div>');
		conteudoDiv.append($(conteudo));
		return conteudoDiv;
	};

	var montaBotaoFecharDiv = function() {
		var botaoFecharDiv = $('<div>');
		botaoFecharDiv.addClass('modalBotaoFechar');
		$.click(botaoFecharDiv, function() {
			$.unblockUI();
		});
		return botaoFecharDiv;
	};

	var esconderCabecalho = function() {
		cabecalhoDiv.hide();
	}

	var mostrarBotaoFechar = function() {
		botaoFechar.show();
	}

	var esconderBotaoFechar = function() {
		botaoFechar.hide();
	}

	var montaRodapeDiv = function (options) {
		var divRodape =  $('<div class="footerSajModal fundoCinzaSajModal">');
		var divInternoRodape = $('<div class="boxInternoSajModal alinhamentoDireitaSajModal">');
		divRodape.html(divInternoRodape);
		var spanBotoes = $('<span class="espacoDireitaSajModal">');
		divInternoRodape.html(spanBotoes);
		var botaoOK = $('<input type="button" class="spwBotaoDefault botaoOk">');
		botaoOK.val('Ok')
		spanBotoes.html(botaoOK);
		botaoOK.click($.saj.closePopupModal)
		return divRodape;
	}
	
	var eventoFechandoBotaoSemAcao = function(sajOpts) {
		$.event.trigger({
			type: "fechandoModalSemAcao",
			message: sajOpts
		})
		
	}

	var ajustarTamanhoDivComScroll = function(){
		var divMensagem = $('.mensagem-alerta-popup-modal:last');
		var cabecalho = $('.popup-modal-div-all:last').find('table').height();
		var rodape = $('.boxInternoSajModal.alinhamentoDireitaSajModal').height();
		var blockui = $('.blockUI.blockMsg.blockPage:last').height();
		divMensagem.height(blockui - (2*cabecalho) - rodape);
		divMensagem.css({'overflow-y':'scroll', 'overflow-x' : 'hidden'});
	};

	var getWindowSize = function() {
		var myWidth = 0, myHeight = 0;
		if( typeof( window.innerWidth ) == 'number' ) {
			 //Non-IE
			 myWidth = window.innerWidth;
			 myHeight = window.innerHeight;
		} else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
			 //IE 6+ in 'standards compliant mode'
			 myWidth = document.documentElement.clientWidth;
			 myHeight = document.documentElement.clientHeight;
		} else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
			 //IE 4 compatible
			 myWidth = document.body.clientWidth;
			 myHeight = document.body.clientHeight;
		}
		return { height: myHeight, width: myWidth}
	};


	window.alert = function (msg, options) {
		if (!options) {
			options = {};
		}
		var $input = $(options.campoValidado);
		var $boxText = $('<div id="mensagemAlert" class="mensagem-alerta-popup-modal" tabindex="0" role="alert" aria-live="assertive">')
		$boxText.html(msg)
		if (!options.titulo) {
			options.titulo = 'Aviso'
		}
		if (options.mostrarBotaoOk === undefined) {
			options.mostrarBotaoOk = true;
		}
		if (!options.altura) {
			options.altura = 120;
		}
		if (!options.largura) {
			options.largura = 450
		}
		$(document).on('fechandoModal',function () {
			if ($input.is(':text')) {
				$input.focus();
			};
		});
		options.antesDeMostrarPopup = function (html) {
			html.focus();
		}
		popupModal($boxText, options);
		ajustarTamanhoDivComScroll();
		$boxText.focus();
	}


})(jQuery);
