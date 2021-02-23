//********************************************************************************
// sajCampoNuProcesso
//********************************************************************************

function PG_KDN(campo, teclaPress){
	var tecla = teclaPress.keyCode;
	var valor = campo.value;
	
	if(tecla == 13){//Tecla Enter
		PG_KUP(campo, teclaPress);
		PG_BLR(campo);
		return true;
	}
	
	//Nas situações abaixo não deve fazer validação não faz nada
	if (C_NaoPodeProcessarOnKeyPress(campo, teclaPress))
		return true;
	
	//Teclas Backspace, Delete, direcionais e Tab.
	if(tecla == 8 || tecla == 46 || tecla == 37 || tecla == 39 || tecla == 9)
		return true;
	
	
	//Tamanho Excedeu o limite
	if(valor.length >= 21)
		return false;
		
	//Só pode digitar barra neste ponto
	if(valor.length == 15 &&
	(tecla != 193 && tecla != 111) ){
		return false;
	}
	
	//Tecla "/"
	if(tecla == 193 || tecla == 111){
		
		return valor.length == 15;
	}
		
	//Tecla "-"
	if(tecla == 109){
		var primPonto = valor.indexOf(".");
		var segPonto = -1;
		if(primPonto > 0){
			segPonto = valor.indexOf(".", primPonto+1);
		}
		var traco = valor.indexOf("-");
		return ( segPonto > 0 && traco < 0 );
	}
	
			
	//Tecla "."
	if(tecla == 194 || tecla == 190){
		var primPonto = valor.indexOf(".");
		var segPonto = -1;
		var traco = valor.indexOf("-");
		if(primPonto > 0){
			segPonto = valor.indexOf(".", primPonto+1);
		}
		return ( segPonto < 0 && traco < 0 );
	}
	//Teclas numéricas
	return ( (tecla >= 96 && tecla <= 105) || (tecla >= 48 && tecla <= 57) );
}

function atualizaPosicoes(valor){
	var posPrimPonto = valor.indexOf(".");
	var posSegPonto = -1;
	var posTraco = valor.indexOf("-");
	if(posPrimPonto > 0){
		posSegPonto = valor.indexOf(".", posPrimPonto+1);
	}
	
	var posBarra = valor.indexOf("/");
	
	return (new Array(posPrimPonto, posSegPonto, posTraco, posBarra));
}


function PG_KUP(campo, teclaPress){
	var valorAtual = campo.value;
	var blocoAtual;
	var pos = atualizaPosicoes(valorAtual);//{ponto1, ponto2, traço, barra}
	
	//Limpa traço antes dos dois pontos
	if((pos[2] != -1 && pos[2] < pos[0]) || (pos[2] != -1 && pos[2] < pos[1])){
		valorAtual = "" + valorAtual.substring(0, pos[2]) + valorAtual.substring(pos[2]+1, valorAtual.length);
		pos = atualizaPosicoes(valorAtual);
	}
	//Digitacao normal (esperada)
	if(pos[0] < 0){
		blocoAtual = 1;
	}else{
		if(pos[1] < 0){
			blocoAtual = 2;
		}else{
			if(pos[2] < 0){
				blocoAtual = 3;
			}else{
				if(pos[3] < 0){
					blocoAtual = 4;
				}else{
					blocoAtual = 5;
				}
			}
		}
	}
	//inserindo os caracteres de separacao('.' e '-') caso sejam digitados apenas numeros
	var inicio = "";
	if(blocoAtual == 1 && valorAtual.length > 3){
		valorAtual = valorAtual.substring(0,3) + "." + (valorAtual.substring(3, valorAtual.length)).replace(/\D/g,'');
		blocoAtual = 2;
		pos = atualizaPosicoes(valorAtual);
	}
	if(blocoAtual == 2 && valorAtual.length > 6){
		inicio = (valorAtual.substring(0,6)).replace(/\D/g,'')
		valorAtual = inicio.substring(0,3) + "." + inicio.substring(3,5) + "." + (valorAtual.substring(6, valorAtual.length)).replace(/\D/g,'');
		blocoAtual = 3;
		pos = atualizaPosicoes(valorAtual);
	}
	if(blocoAtual == 3 && valorAtual.length > 13){
		inicio = (valorAtual.substring(0,13)).replace(/\D/g,'')
		valorAtual = inicio.substring(0,3) + "." + inicio.substring(3,5) + "." + inicio.substring(5,12) + "-" + (valorAtual.substring(13, valorAtual.length)).replace(/\D/g,'');
		blocoAtual = 4;
		pos = atualizaPosicoes(valorAtual);
	}
	var retorno = completaCampo(valorAtual, blocoAtual);
	if(retorno.length > 21){
		retorno = retorno.substring(0, 21);
	}
	campo.value = aplicaMascaraNuProcesso(retorno);
}

//Completa com zeros no momento em que é digitado um caractere de separação
function completaCampo(valor, blocoAtual){
	var ultimoDigito = valor.substring(valor.length-1, valor.length);
	var retorno = "";
	var pos = atualizaPosicoes(valor);
	var valorPrimBloco = "";
	var valorSegBloco = "";
	var valorTerBloco = "";
	var valorQuaBloco = "";
	if(blocoAtual == 1){
		return valor;
	}else if(blocoAtual == 2 && ultimoDigito == "."){
		valorPrimBloco = completaZeros(valor.substring(0, pos[0]), 3);
		if(valor.length > pos[0]+1)
			valorSegBloco = valor.substring(pos[0]+1, valor.length);
		return("" + valorPrimBloco + "." + valorSegBloco);
	}else if(blocoAtual == 3 && ultimoDigito == "."){
		valorPrimBloco = completaZeros(valor.substring(0, pos[0]), 3);
		valorSegBloco = completaZeros(valor.substring(pos[0]+1, pos[1]), 2);
		if(valor.length > pos[1]+1)
			valorTerBloco = valor.substring(pos[1]+1, valor.length);
		return ("" + valorPrimBloco + "." + valorSegBloco + "." + valorTerBloco);
	}else if(blocoAtual == 4 && ultimoDigito == "-"){
		valorPrimBloco = completaZeros(valor.substring(0, pos[0]), 3);
		valorSegBloco = completaZeros(valor.substring(pos[0]+1, pos[1]), 2);
		valorTerBloco = completaZeros(valor.substring(pos[1]+1, pos[2]), 6);
		if(valor.length > pos[2]+1)
			valorQuaBloco = valor.substring(pos[2]+1, valor.length);
		return ("" + valorPrimBloco + "." + valorSegBloco + "." + valorTerBloco + "-" + valorQuaBloco);
	}
	return valor;
}
function aplicaMascaraNuProcesso(valor){
	
	var temBarra = valor.indexOf("/");

	var valorLimpo = valor.replace(/\D/g,'');
	var digito = "";
	if(valor.length > 0){
		digito = valor.substring(valor.length - 1, valor.length);
		if(digito != "-" && digito != ".")
			digito = "";
	}else{
		return valor;
	}
	if(valorLimpo.length > 3){
		valorLimpo = valorLimpo.substring(0,3) + "." + valorLimpo.substring(3, valorLimpo.length);
	}
	if(valorLimpo.length > 6){
		valorLimpo = valorLimpo.substring(0,6) + "." + valorLimpo.substring(6, valorLimpo.length);
	}
	if(valorLimpo.length > 13){
		valorLimpo = valorLimpo.substring(0,13) + "-" + valorLimpo.substring(13, valorLimpo.length);
	}
	if(valorLimpo.length > 15){
		valorLimpo = valorLimpo.substring(0,15) + "/" + valorLimpo.substring(15, valorLimpo.length);
	}
	else{
		if(temBarra >= 0){
			valorLimpo = valorLimpo + "/";
		}
	}
	valorLimpo = "" + valorLimpo + digito;
	if(valorLimpo.length > 21){
		valorLimpo = valorLimpo.substring(0, 21);
	}
	return (valorLimpo);
}

function completaZeros(nro, tam) {
	nro = nro.replace(/\D/g,'');
	if (nro.length < tam)
		for (i = nro.length; i < tam; i++)
			nro = '0' + nro;
	return nro;
}

function PG_BLR(campo){
	var valor = campo.value
	var pos = atualizaPosicoes(valor);//{ponto1, ponto2, traço, barra}
	var digito = "";
	
	if(pos[0] < 0){
		blocoAtual = 1;
	}else{
		if(pos[1] < 0){
			blocoAtual = 2;
		}else{
			if(pos[2] < 0){
				blocoAtual = 3;
			}else{
				if(pos[3] < 0){
					blocoAtual = 4;
				}else{
					blocoAtual = 5;
				}
			}
		}
	}
	if(blocoAtual == 3 && valor.length > 7){
		digito = valor.substring(valor.length - 1, valor.length);
		valor = valor.substring(0, valor.length - 1);
		valor = "" + valor.substring(0,7) + completaZeros(valor.substring(7, valor.length), 6) + digito;
	}
	valor = aplicaMascaraNuProcesso(valor);
	if( (valor.length < 15 && valor.length != 0) || valor.charAt(valor.length-1) == '/' ){
		if(campo.className.indexOf('erro')==-1){
        	campo.className=campo.className+' erro';
        }
		return;
	}
	if(campo.className.indexOf('erro')!=-1){
      	campo.className=campo.className.substring(0,campo.className.indexOf('erro'));
    }
	campo.value = valor;
}

function validaNuProcessoPG(campo){
	var valor = aplicaMascaraNuProcesso(campo.value);
	
	var temBarra = valor.indexOf("/") != -1;
	
	if(!temBarra){
	  if(valor.length != 15 || valor.length == 0){
		alert('O número de processo digitado não é válido. Número digitado: ' + campo.value + ' .');
		campo.focus();
		return false;
	  }
	}
	else{
	  if(valor.length < 17){
		alert('O número de processo digitado não é válido. Número digitado: ' + campo.value + ' .');
		campo.focus();
		return false;
	  }			
	}
	
	return true;
}

function PG_MOV(ctrl, e){
	if(ctrl.className.indexOf('erro')!= -1){
		C_mostraHint(e, 'O número de processo digitado não é válido. Número digitado: ' + ctrl.value + ' .');
	}
}

function PG_MMOV(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_moveHint(event);
	}
}

function PG_MOUT(ctrl, event){
	if(ctrl.className.indexOf('erro')!= -1){
		C_escondeHint();
	}
}

// ********************************************************************************
// Utilitários para texto 
// ********************************************************************************

(function($){
	$.saj = $.saj || {};
	
	$.saj.removerAcentos = function(texto) {
		if (texto && texto.length > 0) {
			texto = texto.replace(/[áàâãâ]/g, 'a');
			texto = texto.replace(/[ÁÀÂÄÃÂ]/g, 'A');
			texto = texto.replace(/[éê]/g, 'e');
			texto = texto.replace(/[ÉÊ]/g, 'E');
			texto = texto.replace(/[íî]/g, 'i');
			texto = texto.replace(/[ÍÎ]/g, 'I');
			texto = texto.replace(/[õóô]/g, 'o');
			texto = texto.replace(/[ÕÓÔ]/g, 'O');
			texto = texto.replace(/[úü]/g, 'u');
			texto = texto.replace(/[ÚÜ]/g, 'U');
			texto = texto.replace(/ç/g, 'c');
			texto = texto.replace(/Ç/g, 'C');
		}
		return texto;
	};
	
	$.saj.isBlank = function(texto) {
		return(texto.match(/^\s*$/));
	};
	
	//considera o formato dd/MM/yyyy  
	$.saj.simpleParseDate = function(dateStr){
		var dia = dateStr.substr(0,2);
		var mes = dateStr.substr(3,2) - 1;
		var ano = dateStr.substr(6,4);
		return new Date(ano, mes, dia);
	};

	//considera o formato dd/MM/yyyy 
	$.saj.simpleDateToStr = function(date){
		return date.getDate() + '/' + (date.getMonth()+1) + '/' + date.getFullYear();
	};
	
	$.saj.stripHTML = function(string) { 
	    return string.replace(/<(.|\n)*?>/g, ''); 
	};
})(jQuery);


//************************************************************
//Utilitários para SPW
//************************************************************

(function($){
	$.saj = $.saj || {};
	
	$.saj.limparInputSelect = function(idInputSelect) {
		// Salva a variavel global do IS
		var tagIdBackup = _tagId;

		limparInputSelect(idInputSelect);
		
		var $table = $('#'+idInputSelect);
		
		//corrige limpar do input-select multipla selecao
		var $inputDis = $('input.disabled', $table);
		$inputDis.removeClass('disabled');
		$inputDis.removeAttr('readonly');
		
		$table.change();
		
		// Recupera a variavel global do IS
		_tagId = tagIdBackup;
	};
	
	$.saj.habilitaInputSelect = function(idInputSelect){
		habilitaInputSelectById(idInputSelect, document);
	};
	
	$.saj.desabilitaInputSelect = function(idInputSelect){
		desabilitaInputSelectById(idInputSelect, document);
		ajustarAcessibilidadeInputReadonly(idInputSelect);	
	};
	
	var ajustarAcessibilidadeInputReadonly = function(idInputSelect){
		$('#'+idInputSelect).find(':input:visible').attr('aria-label','');
	};
})(jQuery);

//********************************************************************************
//Utilitários para manipulação de campos
//********************************************************************************
	
(function($){
	$.saj.setValue = function($campo, value) {
		if (value == undefined) {
			value = '';
		}
		$campo.val(value);
	};
	
	$.saj.mudaHabilitacaoCampo = function($campo, habilitado) {
        if (isInputSelect($campo[0])) {
        	if (habilitado) {
        		$.saj.habilitaInputSelect($campo.attr('id'));
        	} else {
        		$.saj.desabilitaInputSelect($campo.attr('id'));
        	}
        } else if ($.saj.tree && $.saj.tree.isTreeSelect($campo)) {
        	if (habilitado) {
        		$.saj.tree.habilitaTreeSelect($campo);
        	} else {
        		$.saj.tree.desabilitaTreeSelect($campo);
        	}
        } else if ($campo.is(':checkbox')|| $campo.is(':radio')) {
			if (habilitado) {
				$campo.removeAttr('disabled');
			} else {
				$campo.attr("disabled", true);
			}
        } else if($campo.is(':text')) {
			if (habilitado) {
				$campo.removeAttr('readonly');
				$campo.removeClass('disabled');
			} else {
				$campo.attr("readonly", true);
				$campo.addClass('disabled');
			}
        }
	};
	
	$.saj.campoEstaPreenchido = function($campo) {
		var preenchido = false;
        if (isInputSelect($campo[0])) {
        	preenchido = isInputSelectFilled($campo[0]);
        } else if ($.saj.tree && $.saj.tree.isTreeSelect($campo)) {
        	preenchido = $.trim($.saj.tree.getTreeSelectionValues($campo)) != '';
        } else if ($campo.is(':checkbox') || $campo.is(':radio')) {
        	preenchido = ($campo.is(":checked"));
        } else if($campo.is(':text')) {
        	preenchido = $.trim($campo.val()) != '';
        }
        return preenchido;
	};
	
	$.fn.bindContadorCaracteres = function($spanContador, qtMaximoCaracteres) {
		var $textarea = $(this);
		$textarea.bind('keyup', function() {
			atualizarContadorCaracteres($(this), $spanContador, qtMaximoCaracteres)
		});
		$textarea.keyup();
	};
	
	var atualizarContadorCaracteres = function($textarea, $spanContador, qtMaximoCaracteres) {
		var value = $textarea.val();
		if (value.length > qtMaximoCaracteres) {
			$textarea.val(value.substring(0, qtMaximoCaracteres));
		} else {
			$spanContador.html(qtMaximoCaracteres - value.length);
		}
	};
	
})(jQuery);


// ************************************************************
// Controle de campos dependentes
// ************************************************************
(function($){
	$.saj = $.saj || {};
	
	$.saj.registrarDependencia = function($parent, $children, options) {
		if ($parent[0] && $children[0]) {
			options = $.extend({}, defaultOptions, options||{});
			$parent.each(function(i, parent){registrarDependenciaNoCampo(parent, $children, options);});
		}
	};
	
	var registrarDependenciaNoCampo = function(parent, children, options) {
		if (parent.nodeName === 'INPUT' && (parent.type === 'checkbox' || parent.type === 'radio')) {
			if (options.triggerOn === 'change') {
				options.triggerOn = 'click';
			}
		}
		//Adicionada chamada por função anônima pois o jQuery só empilha bindings de eventos se o evento for diferente, ou a função de callback for diferente. Se for identificada como a mesma, apenas sobrescreve
		$(parent).bind(options.triggerOn, {options:options, children:children}, function(data){onDependencyTriggered.apply(parent, [data]);});
		var data = {options:options.initialSyncOptions, children:children};
		var dataHolder = {data:data};
		onDependencyTriggered.apply(parent, [dataHolder]);
	};
	
	var defaultOptions = {
		initialSyncOptions: {clearOn:'empty',disableOn:'empty'},
		triggerOn: 'change', // 'click'
		clearOn: 'change',   // 'never' || 'change' || 'empty' || 'valueEquals' || 'valueNotEquals' || 'match' || 'notMatch' || 'callback'
		disableOn: 'empty',  // 'never' || 'empty' || 'valueEquals' || 'valueNotEquals' || 'match' || 'notMatch' || 'callback'
		testCallback: null,
		testValue: null,
		testRegExp: null,
		onClearCallback: null,
		onEnableCallback: null,
		onDisableCallback: null,
		autoCompleteIfSingleResult: false, //Autocompleta o filho input-select ou tree-select se houver somente 1 registro.
		setFocusFirstDependent: false
	};
		
	var onDependencyTriggered = function(dataHolder) {
		var options = dataHolder.data.options;
		var children = dataHolder.data.children;
		var value = $(this).val();
		
		if (this.nodeName === 'INPUT') {
			if (this.type === 'radio') {
				if (!this.checked) {
					return;
				}
			} else if (this.type === 'checkbox') {
				 value = this.checked;
			}
		} else if (isInputSelect(this)) {
			var $inputs = $('input[name^="entity"]',this);
			value = $inputs[0] && $inputs[0].value;
		} else if ($.saj.tree && $.saj.tree.isTreeSelect(this)) {
			value = $.saj.tree.getTreeSelectionValues(this);
		}
		
		var triggerClear = shouldClear(options, value);
		var triggerDisable = shouldDisable(options, value);
		var triggerEnable = !triggerDisable && shouldEnable(options, value);
		
		triggerClear && clearDependents(options, children);
		triggerDisable && disableDependents(options, children);
		triggerEnable && enableDependents(options, children);
	};
	
	var shouldClear = function(options, value) {
		var condition = options.clearOn;
		return shouldTrigger(options, value, condition);
	};
	
	var shouldDisable = function(options, value) {
		var condition = options.disableOn;
		if (condition === 'change') {
			// Condição inválida para disable
			return false;
		}
		return shouldTrigger(options, value, condition);
	};
	
	var shouldEnable = function(options, value) {
		var condition = options.disableOn;
		if (condition === 'never' || condition === 'change') {
			return false;
		}
		return !shouldTrigger(options, value, condition);
	};
		
	var shouldTrigger = function(options, value, condition) {
		switch (condition) {
		case 'never':
			decision = false;
			break;
		case 'change':
			decision = true;
			break;
		case 'empty':
			decision = !value;
			break;
		case 'valueEquals':
			decision = (value == options.testValue);
			break;
		case 'valueNotEquals':
			decision = (value == options.testValue);
			break;
		case 'match':
			decision = value.match(options.testValue);
			break;
		case 'notMatch':
			decision = !value.match(options.testValue);
			break;
		case 'callback':
			decision = options.testCallback(value);
			break;
		default:
			decision = false;
		}
		return decision;
	};
	
	var clearDependents = function(options, $dependents) {
		$dependents.each(function() {
			var $dependent = $(this);
			if($dependent.is(':radio')){
				return;
			}
			if(isInputSelect(this)) {
				$.saj.limparInputSelect(this.id);
			} else if ($.saj.tree && $.saj.tree.isTreeSelect(this)) {
				$.saj.tree.limpaTreeSelect(this);
			} else {
				if (!$dependent.is(':checkbox')) {
					$dependent.val('');
				}
				$dependent.change();
				$dependent.blur();
				$dependent.attr('checked', false);
			}
			if (options.onClearCallback) {
				options.onClearCallback(this);
			}
		});
	};
	
	var disableDependents = function(options, $dependents) {
		$dependents.each(function() {
			if(isInputSelect(this)) {
				desabilitaInputSelect(this);
				$(this).find('input:visible').attr('disabled','disabled')
			} else if ($.saj.tree && $.saj.tree.isTreeSelect(this)) {
				$.saj.tree.desabilitaTreeSelect(this);
			} else {
				var $dependent = $(this);
				$dependent.attr('disabled', true);
				$dependent.addClass('disabled');
			}
			if (options.onDisableCallback) {
				options.onDisableCallback(this);
			}
		});
	};
	
	var enableDependents = function(options, $dependents) {
		var focusJaSetado = false;
		$dependents.each(function() {
			if(isInputSelect(this)){
                habilitaInputSelect(this);
				var $is = $(this);
                $is.find('input:disabled').removeAttr('disabled');
				if(options.autoCompleteIfSingleResult && !$is.find('input').val()){
					carregaIS(this.id);
				}
			} else if ($.saj.tree && $.saj.tree.isTreeSelect(this)) {
				$.saj.tree.habilitaTreeSelect(this);
				if(options.autoCompleteIfSingleResult){
					$.saj.tree.loadIfSingleResult(this.id);
				}
			} else {
				var $dependent = $(this);
				$dependent.attr('disabled', false);
				$dependent.removeClass('disabled');
			}
			if (options.onEnableCallback) {
				options.onEnableCallback(this);
			}
			if(!focusJaSetado && options.setFocusFirstDependent){
				if($.saj.tree.isTreeSelect(this)){
					$('input:not(input[type=hidden])', this).focus();
				} else if(isInputSelect(this)){
					$('input:not(input[type=hidden])', this).focus();
				} else{
					this.focus();
				}
				focusJaSetado = true;
			}
		});
	};

	// Dispara o change na alteração do inputSelect
	window.depoisSelecionarRegistros = function(id) {
		var $inputSelect = $('#'+id);
		$inputSelect.change();
	};
	
	// Dispara o change ao limpar o inputSelect
	window.depoisLimparInputSelect = function(id) {
		var $inputSelect = $('#'+id);
		$inputSelect.change();
	};

})(jQuery);

//NulSafe para tratar o problema do .val do jQuery que no I.E. escreve "null" quando o valor é null de vazio.
//********************************************************************************
(function($) {
	$.fn.nullSafeVal = function(value) {
		value = (value === null ? '' : value);
		this.val(value);
	};
	
	$.fn.emptySafeVal = function(value) {
		value = value || this.val();
		this.val(value);
	};
	
	var jqueryAjax = $.ajax;
	
	$.ajax = function (options) {
		options = options || {};
		options.data = options.data || {};
		options.data.conversationId = $('input[name="conversationId"]').val();
		return jqueryAjax(options);
	}
	
})(jQuery);


//********************************************************************************
//Requisição ajax para manter a sessão do usuário
//********************************************************************************
(function($) {
	$.saj = $.saj || {};
	
	/**	Efetua requisição ajax para a url de tempos em tempos, configurado pelo parametro interval **/
	$.saj.manterSessao = function (urlRequest, interval) {
		if (urlRequest) {
			$.ajax({
				url : urlRequest,
				complete : function () {
					if (!$.saj.manterSessao.parar) {
						setTimeout(function () {
							$.saj.manterSessao(urlRequest, interval);
						}, interval);
					}
				}
			});
		}
	};
	
	/** Sentinela para bloquear a função manterSessao(delay, interval) **/
	$.saj.manterSessao.parar = false;

})(jQuery);

//********************************************************************************
//Troca nulo de campos númericos por valor passado via paramêtro
//********************************************************************************
(function($) {
	$.saj = $.saj || {};
	
	$.saj.trocarVazioPorValorPadrao = function(valorPadrao) {
		if ($(this).val()) {
			$(this).val(valorPadrao);
		}
	};
})(jQuery);

(function($){
	// Extensão do jQuery com parseJSON (copiada das versões mais novas. Disponível nas versões 1.4+)
	$.extend({
	    error: function( msg ) { throw msg; },
	    parseJSON: function( data ) {
	    	
	    	// JSON RegExp
	    	rvalidchars = /^[\],:{}\s]*$/,
	    	rvalidbraces = /(?:^|:|,)(?:\s*\[)+/g,
	    	rvalidescape = /\\(?:["\\\/bfnrt]|u[\da-fA-F]{4})/g,
	    	rvalidtokens = /"[^"\\\r\n]*"|true|false|null|-?(?:\d+\.|)\d+(?:[eE][+-]?\d+|)/g;
	    	// Attempt to parse using the native JSON parser first
			if ( window.JSON && window.JSON.parse ) {
				return window.JSON.parse( data );
			}

			if ( data === null ) {
				return data;
			}

			if ( typeof data === "string" ) {

				// Make sure leading/trailing whitespace is removed (IE can't handle it)
				data = jQuery.trim( data );

				if ( data ) {
					// Make sure the incoming data is actual JSON
					// Logic borrowed from http://json.org/json2.js
					if ( rvalidchars.test( data.replace( rvalidescape, "@" )
						.replace( rvalidtokens, "]" )
						.replace( rvalidbraces, "")) ) {

						return ( new Function( "return " + data ) )();
					}
				}
			}
	    }
	});
})(jQuery);


(function($) {
	$.saj = $.saj || {};
	
	$.saj.logarExcecaoNoServidor = function(exception) {
		$.ajax({
			url: 'logarExcecao.do',
			data: {
				exception: exception
			},
            type: 'POST'
		});
	};
})(jQuery);
