/*
 * SAJ-MASCARA-INPUT
 * Campo numérico formatado com mascara de input
 */
(function($) {
	
	/**
	 * Options - Callbacks para os metodos de binding
	 * 
	 * -afterPaste: callback chamado antes atualizarTexto no onPaste
	 */
	var defaults = {		
		afterPaste:function(){}
	};
	
	var getOptions = function(options){
		if(!options){
			 options = {};
		}		
		return $.extend({},defaults,options);		
	};
	
	/**
	 * Configura a mascara de input de um campo.
	 * Parametros:
	 *   - $input: campo a ser configurado
	 *   - mascara: mascara a ser aplicada ao campo.
	 *              pode usar o caractere 9 para indicar digitos numéricos sem preenchimento automático
	 *              pode usar o caractere 0 para indicar número com zeros à esquerda (o numero de 0s indica o numero de zeros à esquerda),
	 *              pode usar o caractere A para indicar um ano (AA para ano de dois dígitos, AAAA para ano de quatro dígitos),
	 *              pode usar caracteres não numéricos para apresentar os caracteres fixos de do input formatado.
	 *   - nextField: parametro opcional, indica se deve existir o comportamento de auto-tab para esse campo quando a mascara é completada.
	 * Ex.:
	 *   0000000-99.AAAA - 7 digitos com preenchimento automatico com zeros à esquerda, 
	 *                     depois um hífen seguido de dois dígitos sem preenchimento automático
	 *                     depois um ponto seguido de um ano com quadro dígitos com preenchimento automático 
	 */
	var configurar = function($input, mascara, nextField,options) {
		var mascaraProcessada = processarMascara(mascara);
		var data = {mascaraProcessada: mascaraProcessada, nextField: nextField};
		var opts = getOptions(options);
		
		// binds nos eventos do input com os dados acima
		$input.bind('keypress', function(event) { return onKeypress(event, data); });
		$input.bind('cut', function(event) { return onCut(event, data); });
		$input.bind('paste', function(event) { return onPaste(event, data, opts); });
		$input.bind('blur', function(event) { return onBlur(event, data); });
		$input.bind('focus', function(event) { return onFocus(event, data); });
		if ($.browser.msie || $.browser.safari) {
			$input.bind('keydown', function(event) { return onKeydown(event, data); });
		}
		atualizarTexto($input, mascaraProcessada);
	};
	
	/**
	 * Processar a mascara indexando os separadores e setando as propriedades:
	 *   - tamanho: tamanho da mascara
	 *   - mascara: mascara limpa de caracteres especias (0, 9, A)
	 *   - separadores: set de separadores presentes na mascara
	 *   - indiceSeparadores: array de cada separador que sucede uma sequencia com preenchimento automático
	 *   - qtdDigitos: quantidade de digitos significativos da mascara 
	 */
	var processarMascara = function(mascara) {
		var separadoresIndexados = indexarSeparadores(mascara);
		var mascaraProcessada = {};
		mascaraProcessada.tamanho = mascara.length;
		mascaraProcessada.mascara = separadoresIndexados.mascaraLimpa;
		mascaraProcessada.separadores = separadoresIndexados.separadores;
		mascaraProcessada.indiceSeparadores = separadoresIndexados.indice;
		mascaraProcessada.qtdDigitos = separadoresIndexados.qtdDigitos;
		return mascaraProcessada;
	};
	
	/**
	 * Indexa os separadores da mascara.
	 * São mais interessantes aqueles que sucedem uma sequencia com preenchimento automático (ZEROS_A_ESQUERDA, AAAA ou AA)
	 * Retorna um objeto que contém:
	 *   - separadores: set de separadores presentes na mascara
	 *   - indice: array de cada separador que foi indexado
	 *   - qtdDigitos: quantidade de digitos significativos da mascara
	 *   - mascaraLimpa: mascara com os caracteres especias (0, 9, A) substituidos por espaços
	 */
	var indexarSeparadores = function(mascara) {
		var mascaraLimpa = '';
		var indice = [];
		var count = 0;
		var idxDigitoAnterior = 0;
		var setSeparadores = {};
		mascara = mascara.split('');
		
		for (var pos=0; pos<mascara.length; pos+=1) {
			var char = mascara[pos];
			
			// Atualizar a mascaraLimpa
			var charLimpo = char;
			if (char === '0' || char === '9' || char == 'A') {
				charLimpo = ' ';
			}
			mascaraLimpa += charLimpo;

			if (isSeparador(char)) {
				// Adicionar o separador ao objeto com as propriedades identificando os separadores (um set)
				setSeparadores[char] = true;

				// Indexar separador (retorna null quando o separador não tem função de preenchimento de texto)
				indice[count] = indexarSeparador(char, pos, idxDigitoAnterior, mascara);
				count += 1;
			} else {
				// Não era um separador, então era um dígito significativo
				idxDigitoAnterior += 1;
			}
		}
		
		// indexar um separador fake (separador == null) 
		// quando o ultimo caractere não é um separador 
		// (como se existisse um separador no fim do campo)
		var char = mascara[mascara.length - 1];
		if (!isSeparador(char) && (char === '0' || char === 'A')) {
			var pos = mascara.length;
			var indiceSeparador = indexarSeparador(null, pos, idxDigitoAnterior, mascara);
			if (indiceSeparador.digitos > 0) {
				indice[count] = indiceSeparador;
			}
		}

		// Criar um array a partir de um objeto de valores
		var separadores = [];
		for (var ch in setSeparadores) {
			separadores.push(ch);
		}
		
		return {separadores: separadores, indice: indice, qtdDigitos: idxDigitoAnterior, mascaraLimpa: mascaraLimpa}; 
	};
	
	/**
	 * Indexar um separador.
	 * Retorna um objeto com:
	 *   - separador: caractere do separador
	 *   - pos: posição do separador na mascara
	 *   - idxDigitoAnterior: qual é o dígito significativo anterior ao separador
	 *   - tipo: tipo de preenchimento (ZEROS_A_ESQUERDA, AAAA ou AA)
	 *   - digitos: numero de dígitos para o preenchimento automático
	 */
	var indexarSeparador = function(separador, pos, idxDigitoAnterior, mascara) {
		if (pos <= 0) {
			return null;
		}
		var tipo = '';
		var digitos = 0;
		var anterior = mascara[pos - 1];
		if (anterior === '0' || anterior === 'A') {
			for (var i=pos-1; i>=0; i-=1) {
				if (mascara[i] === anterior) {
					digitos += 1;
				} else {
					break;
				}
			}
			if (anterior === '0') {
				valido = true;
				tipo = 'ZEROS_A_ESQUERDA';
			} else if (anterior === 'A') {
				if (digitos === 2) {
					valido = true;
					tipo = 'AA';
				} else if (digitos === 4) {
					valido = true;
					tipo = 'AAAA';
				}
			}
		}
		return {
				separador: separador,
				pos: pos,
				idxDigitoAnterior: idxDigitoAnterior,
				tipo: tipo,
				digitos: digitos
		};
	};
	
	/**
	 * Processamento para o input de uma tecla.
	 * Algumas teclas são repassadas diretamente para o browser (CTRL+C, etc).
	 * Algumas teclas tem tratamento especial (backspace e del).
	 * Controla se o campo não iria exceder o tamanho da mascara.
	 * Processa e formata a entrada de um novo dígito.
	 * Processa a digitação de um separador que pode implicar em preenchimento automatico do numero que prescede o separador.
	 */
	var onKeypress = function(event, data) {
		var $input = $(event.target);

		if (typeof data === 'undefined') {
			return;
		}
		
		// Tab com nextField?
		var keyCode = event.keyCode;
		if (keyCode === 9 && data.nextField) {
			$input.blur();
			data.nextField.focus();
			return false;
		}
		
		// Gerar o blur/change antes da submissão do formulário
		if (keyCode === 13) {
			$input.change();
			$input.blur();
		}
		
		// Repassa CTRL, TAB entre outros
		if (deveRepassarEvento(event)) {
			return true;
		}
		
		var mascaraProcessada = data.mascaraProcessada;
		var nextField = data.nextField;
		var range = selectionRange($input);
		var idxDigito = digitoDoCursor($input);
		
		// Backspace?
		if (keyCode === 8) {
			backspace($input, mascaraProcessada, range, idxDigito);
			return false;
		}
		
		// Del?
		if (keyCode === 46) {
			del($input, mascaraProcessada, range, idxDigito);
			return false;
		}
		
		// No final do input?
		if (idxDigito >= mascaraProcessada.tamanho) {
			return false;
		}
		
		// Digito? Aceitar input
		var which = event.which;
		if (which >= 48 && which <= 57) {
			inserir($input, mascaraProcessada, which, idxDigito);
			if (nextField && $input.val().indexOf(' ') < 0) {
				$input.change();
				$input.blur();
				nextField.focus();
			}
			return false;
		}
		
		// -?
		var char = String.fromCharCode(which);
		var separadores = mascaraProcessada.separadores;
		var ehSeparador = false;
		for (var i=0; i<separadores.length; i+=1) {
			if (separadores[i] === char) {
				ehSeparador = true;
				break;
			}
		}
		if (ehSeparador) {
			texto = textoComPreenchimentoAutomatico($input, mascaraProcessada, idxDigito);
			if (texto) {
				atualizarTexto($input, mascaraProcessada, texto);
			}
			var valorDoInput = $input.val();
			if (nextField && valorDoInput.length > 0 && valorDoInput.indexOf(' ') < 0) {
				$input.change();
				$input.blur();
				nextField.focus();
			}
			return false;
		}

		// Ignora outras teclas
		return false;
	};

	/**
	 * Função somente para o FF.
	 * Apaga a seleção ou apaga um dígito para trás (pulando a mascara)
	 */
	var backspace = function($input, mascaraProcessada, range, idxDigito) {
		var texto;
		if (range.hasSelection) {
			texto = textoAposTecla($input, '');
		} else if (range.start > 0) {
			idxDigito -= 1;
			texto = removerTecla($input, idxDigito, mascaraProcessada);
		}
		atualizarTexto($input, mascaraProcessada, texto, idxDigito);
	};

	/**
	 * Função somente para o FF
	 * Apaga a seleção ou apaga o digito a frente (pulando a máscara)
	 */
	var del = function($input, mascaraProcessada, range, idxDigito) {
		if (range.hasSelection) {
			texto = textoAposTecla($input, '', mascaraProcessada);
		} else if (range.start < mascaraProcessada.tamanho) {
			texto = removerTecla($input, idxDigito, mascaraProcessada);
		}
		atualizarTexto($input, mascaraProcessada, texto, idxDigito);
	};

	/**
	 * Insere um dígito substituindo a seleção (se houver)
	 */
	var inserir = function($input, mascaraProcessada, which, idxDigito) {
		idxDigito += 1;
		var texto = textoAposTecla($input, String.fromCharCode(which), mascaraProcessada);
		atualizarTexto($input, mascaraProcessada, texto, idxDigito);
	};

	/**
	 * Evento que ocorre antes do cut do texto selecionado.
	 * Programa a reformatação do campo para ocorrer daqui a 200 millis (depois que o cut realemente ocorrer no input)
	 */
	var onCut = function(event, data) {
		if (typeof data === 'undefined') {
			return;
		}
		var $input = $(event.target);
		window.setTimeout(function() {atualizarTexto($input, data.mascaraProcessada);}, 200);
	};

	/**
	 * Evento que ocorre antes do paste no input.
	 * No caso do IE o paste pode ser evitado caso o texto a ser inserido seja considerado inválido.
	 * No caso do FF o paste irá ocorrer de qualquer maneira. Por isso a funcão guarda aqui o valor original e 
	 * programa uma validação que pode fazer undo do paste para ocorrer daqui a 200 millis (depois que o pasta já foi realizado pelo browser)
	 */
	var onPaste = function(event, data,opts) {
		if (typeof data === 'undefined') {
			return;
		}
		var $input = $(event.target);
		var mascaraProcessada = data.mascaraProcessada;
		
		// IE?
		if (window.clipboardData) {
			// Texto pode ser parte da mascara?
			var clip = window.clipboardData.getData("Text");
			var ok = matchParteDaMascara(clip, mascaraProcessada);
			if (ok) {
				window.setTimeout(function() {					
					opts.afterPaste($input.val());
					atualizarTexto($input, mascaraProcessada, clip);
				}, 200);
			}
			return ok;
		} else {
			var conteudoAntesDoPaste = event.target.value;
			window.setTimeout(function() {
				var texto = $input.val();
				if (matchParteDaMascara(texto, mascaraProcessada)) {
					opts.afterPaste(texto);
					atualizarTexto($input, mascaraProcessada, texto);
				} else {
					$input.val(conteudoAntesDoPaste);
				}
			}, 200);
			
			return true;
		}
	};
	
	/**
	 * Funcção somente para o IE e Safari.
	 * Tratamento do BackSpace e Del que não dispara o keypress nesses eventos nesses browsers.
	 */
	var onKeydown = function(event, data) {
		if ($.browser.msie || $.browser.safari) {
			if (typeof data === 'undefined') {
				return;
			}
			var mascaraProcessada = data.mascaraProcessada;
			var $input;

			// Backspace?
			if (event.keyCode === 8) {
				$input = $(event.target);
				var range = selectionRange($input);
				if (!range.hasSelection && range.start > 0) {
					var valor = $input.val();
					var idxDigito = digitoDoCursor($input);
					var letra = valor.substr(range.start - 1, 1);
					if (letra === '.' || letra == '-') {
						var left = valor.substring(0, range.start-2);
						var right = valor.substring(range.start);
						atualizarTexto($input, mascaraProcessada, left+right, idxDigito-1);
						return false;
					} else {
						idxDigito -= 1;
						texto = removerTecla($input, idxDigito);
						atualizarTexto($input, mascaraProcessada, texto, idxDigito);
						return false;
					}
				}
			}
			// Del?
			if (event.keyCode === 46) {
				$input = $(event.target);
				range = selectionRange($input);
				idxDigito = digitoDoCursor($input);
				if (range.hasSelection) {
					texto = textoAposTecla($input, '');
					atualizarTexto($input, mascaraProcessada, texto, idxDigito);
				} else if (range.start < 15) {
					texto = removerTecla($input, idxDigito);
					atualizarTexto($input, mascaraProcessada, texto, idxDigito);
				}
				return false;
			}
		}
		return true;
	};
	
	/**
	 * Atualiza a classe do input ao perder o foco.
	 * Também tenta realizar preenchimento automático do final do campo,
	 * útil para o usuário poder usar o TAB com preenchimento automático.
	 */
	var onBlur = function(event, data) {
		if (typeof data === 'undefined') {
			return;
		}
		var $input = $(event.target);
		var mascaraProcessada = data.mascaraProcessada;
		if ($input.val().length > 0) {
			var idxDigito = mascaraProcessada.qtdDigitos - 1;
			var texto = textoComPreenchimentoAutomatico($input, mascaraProcessada, idxDigito);
			if (texto && texto.length === mascaraProcessada.qtdDigitos) {
				atualizarTexto($input, mascaraProcessada, texto, 0, true);
			} else {
				atualizarClassesDeValidacao(true, $input, mascaraProcessada);
			}
		}
		$input.change();
		return true;
	};

	/**
	 * Atualiza a classe do input quando perde o foco.
	 */
	var onFocus = function(event, data) {
		if (typeof data === 'undefined') {
			return;
		}
		var mascaraProcessada = data.mascaraProcessada;
		atualizarClassesDeValidacao(false, $(event.target), mascaraProcessada);
	};

	/**
	 * Atualiza o conteúdo do input com o texto formatado.
	 * Mantém o cursor na posição correta (informada depois do último dígito)
	 */
	var atualizarTexto = function($input, mascaraProcessada, texto, digitoCursor, notSetCursor) {
		var lerTextoDoInput = (texto === undefined || texto === null);
		texto = lerTextoDoInput ? $input.val() : texto;
		var digitos = grepDigitos(texto, mascaraProcessada);
		digitoCursor = (digitoCursor || digitoCursor === 0) ? digitoCursor : digitos.length;
		texto = formatar(digitos, mascaraProcessada);
		$input.val(texto);
		if (!notSetCursor) {
			setCursorPosition($input, digitoCursor, mascaraProcessada);
		}
		
		atualizarClassesDeValidacao(false, $input, mascaraProcessada);
	};

	/**
	 * Atualiza as classes do input (deve ser invocado ao receber ou perder o foco).
	 */
	var atualizarClassesDeValidacao = function(forceValidation, $input, mascaraProcessada) {
		var digitos = grepDigitos($input.val());
		var numeroDeDigitos = digitos.length;
		if ((forceValidation && numeroDeDigitos > 0) || numeroDeDigitos >= mascaraProcessada.qtdDigitos) {
			var inputValido = validarInput(digitos, mascaraProcessada);
			var classToAdd = inputValido ? 'inputValido' : 'inputInvalido';
			var classToRem = (inputValido ? 'inputInvalido' : 'inputValido') + ' inputIncompleto';
			$input.
				addClass(classToAdd).
				removeClass(classToRem);
		} else {
			$input.
				addClass('inputIncompleto').
				removeClass('inputValido inputInvalido');
		}
	};
	
	/**
	 * Valida se o input é valido.
	 */
	var validarInput = function(digitos, mascaraProcessada) {
		if (digitos.length == mascaraProcessada.qtdDigitos) {
			// TODO: Custom validation
			return true;
		}
		return false;
	};
		
	/**
	 * Formata o número de acordo com a mascara.
	 * Retorna o número formatado ou vazio se o não houverem dígitos,
	 * dessa maneira o campo vazio não exibe a mascara, mas ao ocorrer o 
	 * primeiro input a mascara ficará evidente.
	 */
	var formatar = function(digitos, mascaraProcessada) {
		if (digitos.length === 0) {
			return '';
		}
		// Remove qualquer coisa alem da quantidade de digitos
		var qtdDigitos = mascaraProcessada.qtdDigitos;
		digitos.splice(qtdDigitos, digitos.length - qtdDigitos);
		
		var indiceSeparadores = mascaraProcessada.indiceSeparadores;
		for (var i=0; i<indiceSeparadores.length; i+=1) {
			var separadorIndexado = indiceSeparadores[i];
			var pos = separadorIndexado.pos;
			if (digitos.length >= pos) {
				digitos.splice(pos, 0, separadorIndexado.separador);
			} else {
				break;
			}
		}
		
		return digitos.join('') + mascaraProcessada.mascara.substring(digitos.length);
	};
	
	/**
	 * Verifica se o texto tem apenas digitos e os separadores da máscara
	 */
	var matchParteDaMascara = function(texto, mascaraProcessada) {
		var separadores = mascaraProcessada.separadores;
		var separadoresStr = '';
		for (var i=0; i<separadores.length; i+=1) {
			var sep = separadores[i];
			if (sep === '\\' || sep === '-') {
				separadoresStr += '\\';
			}
			separadoresStr += sep;
		}
		var rx = new RegExp('^[' + separadoresStr + ' \\d]+$');
		return texto.match(rx) ? true : false;
	};
	
	/**
	 * Verifica se devemos repassar o evento diretamente para o browser.
	 * São definidos como eventos para o browser quando:
	 *   - tecla CTRL ou ALT estiver pressionada
	 *   - TAB, ENTER, SETAS, Fn  
	 */
	var deveRepassarEvento = function(event) {
		if (event.ctrlKey || event.altKey)  {
			return true;
		}

		var keyCode = event.keyCode;
		var which = event.which;
		
		// Tab, Enter?
		if (keyCode === 9 || keyCode === 13) {
			return true;
		}
		
		// Navegacao?
		if (keyCode >= 33 && keyCode <= 40) {
			return true;
		}
		
		// Fn?
		if (keyCode >= 112 && keyCode <= 123 && which === 0) {
			return true;
		}
		
		return false;
	};

	/**
	 * Retorna a posicao do cursor no texto formatado
	 * para que este fique logo após um digito específico.
	 */
	var posicaoDoCursorParaDigito = function(digito, mascaraProcessada) {
		var pos = digito;
		var indiceSeparadores = mascaraProcessada.indiceSeparadores;
		for (var i=0; i<indiceSeparadores.length; i+=1) {
			if (pos >= indiceSeparadores[i].pos) {
				pos += 1;
			} else {
				break;
			}
		}
		return pos;
	};
	
	/**
	 * Retorna após qual dígito do input está o cursor.
	 */
	var digitoDoCursor = function($input) {
		var cursor = selectionRange($input).start;
		var valor = $input.val().split('');
		var count = 0;
		for (var i=0; i<cursor; i+=1) {
			if (valor[i] == ' ') {
				break;
			} else if (valor[i].match(/\d/)) {
				count += 1;
			}
		}
		return count;
	};
	
	/**
	 * Retorna o texto resultante da substituição da seleção pelo dígito inserido:
	 * Retorna TextoAntesDaSelecao + key + TextoDepoisDaSelecao
	 */
	var textoAposTecla = function($input, key) {
		var valor = $input.val();
		var range = selectionRange($input);
		var left = valor.substring(0, range.start);
		var right = valor.substring(range.end);
		return left + key + right;
	};

	/**
	 * Tenta realizar preenchimento automático do campo.
	 * O preenchimento automático ocorre quando o input está em uma parte do campo
	 * com mascara de preenchiment automático (ZEROS, AA ou AAAA) e o usuário digita um separador
	 * ou um TAB.
	 * Retorna o texto após a tentativa de preenchimento automático.
	 */
	var textoComPreenchimentoAutomatico = function($input, mascaraProcessada, idxDigito) {
		var digitos = grepDigitos($input.val());		
		return preencherAutomatico(digitos,mascaraProcessada,idxDigito);		
	};
	
	var preencherAutomatico = function(digitos,mascaraProcessada,idxDigito){
		var indiceSeparadores = mascaraProcessada.indiceSeparadores;
		for (var i=0; i<indiceSeparadores.length; i+=1) {
			var separadorIndexado = indiceSeparadores[i];
			var idxDigitoAnterior = separadorIndexado.idxDigitoAnterior;
			if (idxDigitoAnterior <= idxDigito) {
				continue;
			}
			var tipo =  separadorIndexado.tipo;
			var qtdDigitosIndexados = separadorIndexado.digitos;
			if (qtdDigitosIndexados > 0 && idxDigito + qtdDigitosIndexados > idxDigitoAnterior) {
				if (tipo === 'ZEROS_A_ESQUERDA') {
					while (digitos.length < idxDigitoAnterior) {
						digitos.splice(idxDigitoAnterior - qtdDigitosIndexados, 0, '0');
					}
				} else {
					var valorAno = digitos.splice(idxDigitoAnterior - qtdDigitosIndexados, qtdDigitosIndexados);
					if (tipo === 'AA') {
						if (valorAno.length == 1) {
							digitos.push('0');
							digitos.push(valorAno[0]);
						}
					} else if (tipo === 'AAAA') {
						if (valorAno.length < 4) {
							valorAno = parseInt(valorAno.join(''), 10);
							if (valorAno < 50 || valorAno > 99) {
								valorAno = 2000 + valorAno;
							} else {
								valorAno = 1900 + valorAno;
							}
							valorAno = '' + valorAno;
							digitos = digitos.concat(valorAno.split(''));
						}
					}
				}
			}
			break;	
		}
		return digitos.join('');
	};
		
	/**
	 * Remove um digito do texto e retorna os digitos restantes sem formatação
	 * Invovado pelos handlers de DEL e BACKSPACE.
	 */
	var removerTecla = function($input, idx) {
		var digitos = grepDigitos($input.val());
		digitos.splice(idx, 1);
		return digitos.join('');
	};

	/**
	 * Retorna um array somente com os digitos de um texto.
	 */
	var grepDigitos = function(texto) {
		return $.grep(texto.split(''), isDigit);
	};

	/**
	 * Testa se um caractere é um dígito
	 */
	var isDigit = function(val) {
		return val.match(/\d/) ? true : false;
	};
	
	/**
	 * Testa se um caractere é um separador (não dígito && não A && não espaço).
	 */
	var isSeparador = function(val) {
		return val != ' ' && !isDigit(val) && val != 'A';
	};

	/**
	 * Importa uma função para facilitar o acesso dentro desse namespace, 
	 * convertendo um wrappedSet em um input
	 */
	var selectionRange = function($input) {
		return $.saj.browser.selectionRange($input[0]);
	};

	/**
	 * Seta a posição do cursor no input
	 */
	var setCursorPosition = function($input, idxDigito, mascaraProcessada) {
		var pos = posicaoDoCursorParaDigito(idxDigito, mascaraProcessada);
		$.saj.browser.setCursorPosition($input[0], pos);
	};
	
	
	// --------------------------------------
	// -------------- PUBLICAR --------------	
	// Publica a funcão de configuração e
	// a mascara de Numero Unificado no $.saj
	// --------------------------------------
	$.saj = $.saj || {};
	$.saj.configurarMascaraInput = configurar;
	$.saj.mascaraNumeroUnificado = '0000000-99.AAAA';
	
})(jQuery);
