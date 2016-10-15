/*jslint devel: true, bitwise: true, regexp: true, browser: true, confusion: true, unparam: true, eqeq: true, white: true, nomen: true, plusplus: true, maxerr: 50, indent: 4 */
/*globals jQuery,Font */

/*
 * FontPicker
 *
 * Copyright (c) 2011-2013 Martijn W. van der Lee
 * Licensed under the MIT.
 *
 * Full-featured fontpicker for jQueryUI with full theming support.
 * Most images from jPicker by Christopher T. Tillman.
 * Sourcecode created from scratch by Martijn W. van der Lee.
 */

;
(function ($) {
	"use strict";

	var _fontpicker_index = 0,
			_container_popup = '<div class="ui-fontpicker ui-fontpicker-dialog ui-dialog ui-widget ui-widget-content ui-corner-all" style="display: none;"></div>',
			_container_inline = '<div class="ui-fontpicker ui-fontpicker-inline ui-dialog ui-widget ui-widget-content ui-corner-all"></div>',
			_is_numeric = function (value) {
				return (typeof (value) === 'number' || typeof (value) === 'string') && value !== '' && !isNaN(value);
			},
			_layoutTable = function (layout, callback) {
				var bitmap,
						x,
						y,
						width, height,
						columns, rows,
						index,
						cell,
						html,
						w,
						h,
						colspan,
						walked;

				layout.sort(function (a, b) {
					if (a.pos[1] == b.pos[1]) {
						return a.pos[0] - b.pos[0];
					}
					return a.pos[1] - b.pos[1];
				});

				// Determine dimensions of the table
				width = 0;
				height = 0;
				$.each(layout, function (index, part) {
					width = Math.max(width, part.pos[0] + part.pos[2]);
					height = Math.max(height, part.pos[1] + part.pos[3]);
				});

				// Initialize bitmap
				bitmap = [];
				for (x = 0; x < width; ++x) {
					bitmap.push([]);
				}

				// Mark rows and columns which have layout assigned
				rows = [];
				columns = [];
				$.each(layout, function (index, part) {
					// mark columns
					for (x = 0; x < part.pos[2]; x += 1) {
						columns[part.pos[0] + x] = true;
					}
					for (y = 0; y < part.pos[3]; y += 1) {
						rows[part.pos[1] + y] = true;
					}
				});

				// Generate the table
				html = '';
				cell = layout[index = 0];
				for (y = 0; y < height; ++y) {
					html += '<tr>';
					x = 0;
					while (x < width) {
						if (typeof cell !== 'undefined' && x == cell.pos[0] && y == cell.pos[1]) {
							// Create a "real" cell
							html += callback(cell, x, y);

							for (h = 0; h < cell.pos[3]; h += 1) {
								for (w = 0; w < cell.pos[2]; w += 1) {
									bitmap[x + w][y + h] = true;
								}
							}

							x += cell.pos[2];
							cell = layout[++index];
						} else {
							// Fill in the gaps
							colspan = 0;
							walked = false;

							while (x < width && bitmap[x][y] === undefined && (cell === undefined || y < cell.pos[1] || (y == cell.pos[1] && x < cell.pos[0]))) {
								if (columns[x] === true) {
									colspan += 1;
								}
								walked = true;
								x += 1;
							}

							if (colspan > 0) {
								html += '<td colspan="' + colspan + '"></td>';
							} else if (!walked) {
								x += 1;
							}
						}
					}
					html += '</tr>';
				}

				return '<table cellspacing="0" cellpadding="0" border="0"><tbody>' + html + '</tbody></table>';
			},
			_setWord = function (sentence, word, set) {
				var words = sentence ? sentence.split(' ') : [];
				var index = $.inArray(word, words);
				if (set && index < 0) {
					words.push(word);
				} else if (!set && index >= 0) {
					words.splice(index, 1);
				}
				return words.length > 0 ? words.join(' ') : null;
			},
			_hasWord = function (sentence, word) {
				var r = new RegExp('\\b' + word + '\\b', 'i');
				return r.test(sentence);
			},
			_settings = {
				'line-height': function (fp) {
					var that = this,
						id = 'ui-fontpicker-settings-lineheight';

					this.id = function() {
						return id;
					}

					this.paintTo = function (container) {
						$('<input id="' + id + '" step="5" min="0" max="9999" type="number" value="' + (fp.font.css['line-height'] ? parseInt(fp.font.css['line-height']) : '') + '"/>')
								.appendTo(container)
								.change(function () {
									var value = $(this).val();
									fp.font.css['line-height'] = value ? value + '%' : null;
									fp._change();
								}).after('%');
					};

					this.label = function () {
						return fp._getRegional('line-height');
					};
				},

				'small-caps': function (fp) {
					var that = this,
							id = 'ui-fontpicker-settings-smallcaps';

					this.id = function() {
						return id;
					}

					this.paintTo = function (container) {
						$('<input id="' + id + '" type="checkbox"/>')
								.attr('checked', _hasWord(fp.font.css['font-variant'], 'small-caps'))
								.appendTo(container)
								.change(function () {
									fp.font.css['font-variant'] = $(this).is(':checked') ? 'small-caps' : null;
									fp._change();
								});
					};

					this.label = function () {
						return fp._getRegional('small-caps');
					};
				},

				'underline': function (fp) {
					var that = this,
							id = 'ui-fontpicker-settings-underline';

					this.id = function() {
						return id;
					}

					this.paintTo = function (container) {
						$('<input id="' + id + '" type="checkbox"/>')
								.attr('checked', _hasWord(fp.font.css['text-decoration'], 'underline'))
								.appendTo(container)
								.change(function () {
									fp.font.css['text-decoration'] = _setWord(fp.font.css['text-decoration'], 'underline', $(this).is(':checked'));
									fp._change();
								});
					};

					this.label = function () {
						return fp._getRegional('underline');
					};
				},

				'overline': function (fp) {
					var that = this,
							id = 'ui-fontpicker-settings-overline';

					this.id = function() {
						return id;
					}

					this.paintTo = function (container) {
						$('<input id="' + id + '" type="checkbox"/>')
								.attr('checked', _hasWord(fp.font.css['text-decoration'], 'overline'))
								.appendTo(container)
								.change(function () {
									fp.font.css['text-decoration'] = _setWord(fp.font.css['text-decoration'], 'overline', $(this).is(':checked'));
									fp._change();
								});
					};

					this.label = function () {
						return fp._getRegional('overline');
					};
				},

				'line-through': function (fp) {
					var that = this,
							id = 'ui-fontpicker-settings-linethrough';

					this.id = function() {
						return id;
					}

					this.paintTo = function (container) {
						$('<input id="' + id + '" type="checkbox"/>')
								.attr('checked', _hasWord(fp.font.css['text-decoration'], 'line-through'))
								.appendTo(container)
								.change(function () {
									fp.font.css['text-decoration'] = _setWord(fp.font.css['text-decoration'], 'line-through', $(this).is(':checked'));
									fp._change();
								});
					};

					this.label = function () {
						return fp._getRegional('line-through');
					};
				},

				'letter-spacing': function (fp) {
					var that = this,
							id = 'ui-fontpicker-settings-letterspacing',
							input = null;

					this.id = function() {
						return id;
					}

					this.paintTo = function (container) {
						$('<input id="' + id + '" min="-999" max="999" type="number" value="' + (fp.font.css['letter-spacing'] ? parseInt(fp.font.css['letter-spacing']) : '') + '"/>')
								.appendTo(container)
								.change(function () {
									var value = $(this).val();
									fp.font.css['letter-spacing'] = value && value != 0 ? value + 'px' : null;
									fp._change();
								}).after('px');
					};

					this.label = function () {
						return fp._getRegional('letter-spacing');
					};
				}
			};

	$.fontpicker = new function () {
		this.regional = [];
		this.regional[''] = {
			'ok': 'OK',
			'cancel': 'Cancel',
			'none': 'None',
			'button': 'Font',
			'title': 'Pick a font',
			'family': 'Family:',
			'style': 'Style:',
			'size': 'Size:',
			'line-height': 'Line height',
			'letter-spacing': 'Letter spacing',
			'small-caps': 'Small caps',
			'underline': 'Underline',
			'overline': 'Overline',
			'line-through': 'Strike through',
			previewText: 'The quick brown fox jumps\nover the lazy dog.'
		};

		this.partslists = {
			'full': ['header', 'family', 'style', 'size', 'settings', 'preview', 'footer'],
			'popup': ['family', 'style', 'size', 'settings', 'preview', 'footer'],
			'inline': ['family', 'style', 'size', 'settings', 'preview']
		};

		this.parts = {
			header: function (inst) {
				var that = this,
						e = null,
						_html = function () {
							var title = inst.options.title ? inst.options.title : inst._getRegional('title');

							return '<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">'
									+ '<span class="ui-dialog-title">' + title + '</span>'
									+ '<a href="#" class="ui-dialog-titlebar-close ui-corner-all" role="button">'
									+ '<span class="ui-icon ui-icon-closethick">close</span></a></div>';
						};

				this.init = function () {
					e = $(_html()).prependTo(inst.dialog);
					var close = $('.ui-dialog-titlebar-close', e);
					inst._hoverable(close);
					inst._focusable(close);

					close.click(function () {
						event.preventDefault();
						inst.close();
					});
				};
			},

			family: function (inst) {
				var that = this,
						e = null,
						_families = function () {
							var families = inst.options.families.slice();
							if (inst.options.nullable) {
								families.unshift({
									name: '',
									faces: null
								});
							}
							return families;
						},
						_html = function () {
							var html = '<div>' + inst._getRegional('family') + '</div>';
							html += '<div style="padding-right:4px;"><input class="ui-fontpicker-family-text" type="text"/></div>';
							html += '<div><select class="ui-fontpicker-family-select" size="8">';
							$.each(_families(), function (index, family) {
								html += '<option value="' + family.name + '">' + family.name + '</option>';
							});
							html += '</select></div>';
							return '<div class="ui-fontpicker-family">' + html + '</div>';
						},
						_set = function (name) {
							$.each(_families(), function (index, family) {
								if (family.name.toLowerCase() == name.toLowerCase()) {
									inst.font.css['font-family'] = family.faces;
									inst._change();
									return false;	// break
								}
							});
						};

				this.init = function () {
					e = $(_html()).appendTo($('.ui-fontpicker-family-container', inst.dialog));

					$('.ui-fontpicker-family-text', e).on('change keyup', function () {
						_set($(this).val());
					});

					$('.ui-fontpicker-family-select', e).change(function () {
						_set($(this).val());
					});
				};

				this.repaint = function () {
					var face = inst.font.css['font-family'] ? inst.font.css['font-family'][0] : '';
					$.each(_families(), function (index, family) {
						if (family.faces == inst.font.css['font-family']) {
							$('.ui-fontpicker-family-text,.ui-fontpicker-family-select', e).not(':focus').val(face);
							return false;	// break
						}
					});
				};
			},

			style: function (inst) {
				var that = this,
						e = null,
						_html = function () {
							var html = '<div>' + inst._getRegional('style') + '</div>';
							html += '<div style="padding-right:4px;"><input class="ui-fontpicker-style-text" type="text"/></div>';
							html += '<div><select class="ui-fontpicker-style-select" size="8">';
							$.each(inst.options.styles, function (index, style) {
								html += '<option value="' + style.name + '">' + style.name + '</option>';
							});
							html += '</select></div>';
							return '<div class="ui-fontpicker-style">' + html + '</div>';
						},
						_set = function (name) {
							$.each(inst.options.styles, function (index, style) {
								if (style.name.toLowerCase() == name.toLowerCase()) {
									inst.font.css['font-weight'] = style.weight == 'normal' ? null : style.weight;
									inst.font.css['font-style'] = style.style == 'normal' ? null : style.style;
									inst._change();
									return false;	// break
								}
							});
						};

				this.init = function () {
					e = $(_html()).appendTo($('.ui-fontpicker-style-container', inst.dialog));

					$('.ui-fontpicker-style-text', e).on('change keyup', function () {
						_set($(this).val());
					});

					$('.ui-fontpicker-style-select', e).change(function () {
						_set($(this).val());
					});
				};

				this.repaint = function () {
					var bold = inst.font.css['font-weight'] || 'normal',
							italic = inst.font.css['font-style'] || 'normal';
					$.each(inst.options.styles, function (index, style) {
						if (style.weight == bold
								&& style.style == italic) {
							$('.ui-fontpicker-style-text,.ui-fontpicker-style-select', e).not(':focus').val(style.name);
							return false;	// break
						}
					});
				};
			},

			size: function (inst) {
				var that = this,
						e = null,
						_sizes = function () {
							var sizes = inst.options.sizes.slice();
							if (inst.options.nullable) {
								sizes.unshift('');
							}
							return sizes;
						},
						_html = function () {
							var html = '<div>' + inst._getRegional('size') + '</div>';
							html += '<div style="padding-right:4px;"><input class="ui-fontpicker-size-text" type="text"/></div>';
							html += '<div><select class="ui-fontpicker-size-select" size="8">';
							$.each(_sizes(), function (index, size) {
								html += '<option value="' + size + '">' + size + '</option>';
							});
							html += '</select></div>';
							return '<div class="ui-fontpicker-size">' + html + '</div>';
						},
						_set = function (size) {
							inst.font.css['font-size'] = size ? Math.max(1, parseInt(size, 10)) + 'px' : null;
							inst._change();
						};

				this.init = function () {
					e = $(_html()).appendTo($('.ui-fontpicker-size-container', inst.dialog));

					$('.ui-fontpicker-size-text', e).on('change keyup', function () {
						_set($(this).val());
					});

					$('.ui-fontpicker-size-select', e).change(function () {
						_set($(this).val());
					});
				};

				this.repaint = function () {
					var size = inst.font.css['font-size'] ? parseInt(inst.font.css['font-size'], 10) : '';
					$('.ui-fontpicker-size-text,.ui-fontpicker-size-select', e).not(':focus').val(size);
				};
			},

			settings: function (inst) {
				var that = this,
						e = null,
						_html = function () {
							return '<div class="ui-fontpicker-settings"><ul/></div>';
						};

				this.init = function () {
					e = $(_html()).appendTo($('.ui-fontpicker-settings-container', inst.dialog));

					inst.settings = {};
					$.each(inst.options.settings, function (label, settings) {
						var columns = 3,
								id = 'ui-fontpicker-settings-' + label.toLowerCase() + '-' + _fontpicker_index,
								page = $('<div id="' + id + '"></div>').appendTo(e),
								chunk_size = Math.ceil(settings.length / columns),
								chunks = [].concat.apply([],
								//@todo Better chunking algorithm that prefers columns over chunk_size
								settings.map(function (elem, i) {
									return i % chunk_size ? [] : [settings.slice(i, i + chunk_size)];
								})
								),
								table = $('<table class="ui-fontpicker-settings-table"/>').appendTo(page),
								r,
								row,
								c,
								item;

						for (r = 0; r < chunk_size; ++r) {
							row = $('<tr/>').appendTo(table);
							for (c = 0; c < columns; ++c) {
								if (chunks[c] && chunks[c][r]) {
									item = new _settings[chunks[c][r]](inst);
									$('<td class="ui-fontpicker-settings-label"/>').html('<label for="' + item.id() + '">' + item.label() + '</label>').appendTo(row);
									item.paintTo($('<td/>').appendTo(row));
								} else {
									$('<td width="' + (100 / columns) + '%" colspan="2"/>').appendTo(row);
								}
							}
						}

						$('ul', e).append('<li><a href="#' + id + '">' + label + '</a></li>');
					});

					e.tabs();
				};
			},

			preview: function (inst) {
				var that = this,
						e = null,
						_html;

				_html = function () {
					var text = inst.options.previewText || inst._getRegional('previewText');
					text = text.replace('\n', '<br/>');

					var html = '<div class="ui-fontpicker-preview-text">' + text + '</div>',
							prev = '<div class="ui-fontpicker-preview">' + html + '</div>',
							inner = '<div class="ui-fontpicker-preview-inner">' + prev + '</div>',
							outer = '<div class="ui-fontpicker-preview-outer">' + inner + '</div>';

					return outer;
				};

				this.init = function () {
					e = $(_html()).appendTo($('.ui-fontpicker-preview-container', inst.dialog));
				};

				this.repaint = function () {
					$('.ui-fontpicker-preview-text', e).attr('style', inst.font.toCSS(true));
				};
			},

			footer: function (inst) {
				var that = this,
						e = null,
						id_none = 'ui-fontpicker-special-none-' + _fontpicker_index,
						_html;

				_html = function () {
					var html = '';

					if (!inst.inline && inst.options.showNoneButton) {
						html += '<div class="ui-fontpicker-buttonset">';

						if (!inst.inline && inst.options.showNoneButton) {
							html += '<input type="radio" name="ui-fontpicker-special" id="' + id_none + '"><label for="' + id_none + '">' + inst._getRegional('none') + '</label>';
						}
						html += '</div>';
					}

					if (!inst.inline) {
						html += '<div class="ui-dialog-buttonset">';
						html += '<button class="ui-fontpicker-cancel">' + inst._getRegional('cancel') + '</button>';
						html += '<button class="ui-fontpicker-ok">' + inst._getRegional('ok') + '</button>';
						html += '</div>';
					}

					return '<div class="ui-dialog-buttonpane ui-widget-content">' + html + '</div>';
				};

				this.init = function () {
					e = $(_html()).appendTo(inst.dialog);

					$('.ui-fontpicker-ok', e).button().click(function () {
						inst.close();
					});

					$('.ui-fontpicker-cancel', e).button().click(function () {
						inst.font = $.extend({}, inst.previousFont);
						inst._change(inst.font.set);
						inst.close();
					});

					$('.ui-fontpicker-buttonset', e)[$.fn.controlgroup ? 'controlgroup' : 'buttonset']();

					$('#' + id_none, e).click(function () {
						inst._change(false);
					});
				};
			}
		};

		this.Font = function (style) {
			this.toCSS = function () {
				var css = '';
				$.each(this.css, function (tag, value) {
					if (value !== null) {
						if ($.isArray(value)) {
							var parts = [];
							$.each(value, function (index, part) {
								parts.push(/^\S+$/.test(part) ? part : '"' + part + '"');
							});
							if (parts.length > 0) {
								css += tag + ':' + parts.join(',') + ';';
							}
						} else {
							css += tag + ':' + value + ';';
						}
					}
				});
				return css;
			};

			var objectToStyle = function (object) {
				var css = ['text-decoration'
							, 'font-weight'
							, 'font-style'
							, 'font-variant'
							, 'letter-spacing'
							, 'line-height'
							, 'font-family'
							, 'font-size'
							, 'color'
				],
						style = '';

				$.each(css, function (index, name) {
					style += name + ':' + object.css(name) + ';';
				});

				return style;
			};

			this.copy = function () {
				var font = new $.fontpicker.Font(this.style);
				font.set = this.set;
				return font;
			};

			this.set = false;

			this.css = {};

			var font = this;

			if (typeof style === 'object' && style.jquery) {
				style = objectToStyle(style);
			}

			//@todo this.font = _parseFont(text); //@todo parseFont from text (css-like?) return Font object
			var shell = $('<div>').appendTo('body');
			var item = $('<div style="' + style + '"/>').appendTo(shell);

			var results = {};

			// Compare-to-normal, unchanged
			$.each({
				'text-decoration': 'none'
				, 'font-weight': 'normal'
				, 'font-style': 'normal'
				, 'font-variant': 'normal'
				, 'letter-spacing': 'normal'
			}, function (tag, value) {
				shell.css(tag, value);
				var actual = item.css(tag);
				if (actual != value) {
					font.css[tag] = actual;
				}
			});

			// Compare-to-normal, percentage-to-fontsize
			$.each({
				'line-height': 'normal'
			}, function (tag, value) {
				shell.css(tag, value);
				var actual = item.css(tag);
				if (actual != value) {
					font.css[tag] = parseInt(parseInt(actual) * 100 / parseInt(item.css('font-size'))) + '%';
				}
			});

			// Detect non-change
			$.each({
				'font-family': ['sans-serif', 'serif']
				, 'font-size': ['10px', '20px']
				, 'color': ['black', 'white']
			}, function (tag, values) {
				shell.css(tag, values[0]);
				var actual = item.css(tag);
				shell.css(tag, values[1]);
				if (actual == item.css(tag)) {
					font.css[tag] = actual;
				}
			});

			shell.remove();
		};
	};

	$.widget("vanderlee.fontpicker", {
		options: {
			altField: '', // selector for DOM elements which matches changes.
			altOnChange: true, // true to update on each change, false to update only on close.
			autoOpen: false, // Open dialog automatically upon creation
			buttonImage: 'images/ui-fontpicker.png',
			buttonImageOnly: false,
			buttonText: null, // Text on the button and/or title of button image.
			closeOnEscape: true, // Close the dialog when the escape key is pressed.
			closeOnOutside: true, // Close the dialog when clicking outside the dialog (not for inline)
			duration: 'fast',
			regional: '',
			layout: {
				family: [0, 0, 1, 1], // Left, Top, Width, Height (in table cells).
				style: [1, 0, 1, 1],
				size: [2, 0, 1, 1],
				settings: [0, 1, 3, 1],
				preview: [0, 2, 3, 1]
			},
			modal: false, // Modal dialog?
			parts: '', // leave empty for automatic selection
			showAnim: 'fadeIn',
			showNoneButton: false,
			showOn: 'focus', // 'focus', 'button', 'both'
			showOptions: {},
			title: null,
			previewText: null,
			families: [{name: 'Arial',
					faces: ['Arial', 'Helvetica', 'sans-serif']
				},
				{name: 'Arial Black',
					faces: ['Arial Black', 'Gadget', 'sans-serif']
				},
				{name: 'Comic Sans MS',
					faces: ['Comic Sans MS', 'cursive', 'sans-serif']
				},
				{name: 'Courier New',
					faces: ['Courier New', 'Courier', 'monospace']
				},
				{name: 'Georgia',
					faces: ['Georgia', 'serif']
				},
				{name: 'Impact',
					faces: ['Impact', 'Charcoal', 'sans-serif']
				},
				{name: 'Lucida Console',
					faces: ['Lucida Console', 'Monaco', 'monospace']
				},
				{name: 'Lucida Sans Unicode',
					faces: ['Lucida Sans Unicode', 'Lucida Grande', 'sans-serif']
				},
				{name: 'Palatino Linotype',
					faces: ['Palatino Linotype', 'Book Antiqua', 'Palatino', 'serif']
				},
				{name: 'Tahoma',
					faces: ['Tahoma', 'Geneva', 'sans-serif']
				},
				{name: 'Times New Roman',
					faces: ['Times New Roman', 'Times', 'serif']
				},
				{name: 'Trebuchet MS',
					faces: ['Trebuchet MS', 'Helvetica', 'sans-serif']
				},
				{name: 'Verdana',
					faces: ['Verdana', 'Geneva', 'sans-serif']
				}
			],
			styles: [{name: 'Normal',
					weight: 'normal',
					style: 'normal'
				},
				{name: 'Bold',
					weight: 'bold',
					style: 'normal'
				},
				{name: 'Italic',
					weight: 'normal',
					style: 'italic'
				},
				{name: 'Bold italic',
					weight: 'bold',
					style: 'italic'
				}
			],
			sizes: [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 21, 24, 36, 48, 60, 72],
			settings: {'Character': [
					'letter-spacing',
					'small-caps',
					'underline',
					'overline',
					'line-through'
				],
				'Paragraph': [
					'line-height'
				]
			},
			nullable: true,

			close: null,
			select: null
		},

		_create: function () {
			var that = this;

			++_fontpicker_index;

			that.widgetEventPrefix = 'fontpicker';

			that.opened = false;
			that.generated = false;
			that.inline = false;	//@todo use that.source = null
			that.changed = false;
			that.source = false;	// value/text/false

			that.dialog = null;
			that.button = null;
			that.image = null;
			that.overlay = null;

			if (that.element[0].nodeName.toLowerCase() === 'input') {
				that.source = 'val';
			} else if (that.element.text()) {
				that.source = 'css';
			} else {
				that.inline = true;
			}

			if (that.inline) {
				$(that.element).empty();
				that.dialog = $(_container_inline).appendTo(that.element);

				that.open();
			} else {
				that.dialog = $(_container_popup).appendTo('body');

				// Close dialog on mouse button
				$(document).mousedown(function (event) {
					if (!that.opened || event.target === that.element[0]) {
						return;
					}

					// Check if clicked on any part of dialog
					if (that.dialog.is(event.target) || that.dialog.has(event.target).length > 0) {
						that.element.blur();	// inside window!
						return;
					}

					// Check if clicked on button
					var p,
							parents = $(event.target).parents();
					for (p in parents) {
						if (that.button !== null && parents[p] === that.button[0]) {
							return;
						}
					}

					// no closeOnOutside
					if (!that.options.closeOnOutside) {
						return;
					}

					that.close();
				});

				// Close dialog on escape key
				$(document).keydown(function (event) {
					if (event.keyCode == 27 && that.options.closeOnEscape) {
						that.close();
					}
				});

				// Close dialog on tab key (lose focus)
				that.element.keydown(function (event) {
					if (event.keyCode === 9) {
						that.close();
					}
				}).keyup(function (event) {
					//@todo Font parsing from text input
//					var rgb = _parseHex(that.element.val());
//					if (rgb) {
//						that.color = (rgb === false ? new Font() : new Font(rgb[0], rgb[1], rgb[2]));
//						that._change();
//					}
				});

				// Open dialog on focus
				if (that.options.showOn === 'focus' || that.options.showOn === 'both') {
					// Open dialog on focus
					that.element.focus(function () {
						that.open();
					});

					// Open dialog on click
					that.element.click(function () {
						that.open();
					});
				}

				// Open dialog on button
				if (that.options.showOn === 'button' || that.options.showOn === 'both') {
					if (that.options.buttonImage !== '') {
						var text = that.options.buttonText ? that.options.buttonText : that._getRegional('button');

						that.image = $('<img/>').attr({
							'src': that.options.buttonImage,
							'alt': text,
							'title': text
						});
					}

					if (that.options.buttonImageOnly && that.image) {
						that.button = that.image;
					} else {
						that.button = $('<button type="button"></button>').html(that.image || that.options.buttonText).button();
						that.image = that.image ? $('img', that.button).first() : null;
					}
					that.button.insertAfter(that.element).click(function () {
						that[that.opened ? 'close' : 'open']();
					});
				}

				// Automatically open dialog
				if (that.options.autoOpen) {
					that.open();
				}
			}

			return this;
		},

		_setOption: function (key, value) {
			var that = this;

			switch (key) {
				case "disabled":
					if (value) {
						that.dialog.addClass('ui-fontpicker-disabled');
					} else {
						that.dialog.removeClass('ui-fontpicker-disabled');
					}
					break;
			}

			$.Widget.prototype._setOption.apply(that, arguments);
		},

		/**
		 * If an alternate field is specified, set it according to the current font.
		 */
		_setAltField: function () {
			if (this.options.altOnChange && this.options.altField) {
				$(this.options.altField).attr('style', this.font.set ? this.font.toCSS() : '');
			}
		},

		_setFont: function (style) {
			var that = this,
					found = false,
					faces;

			that.font = new $.fontpicker.Font(style);

			if (that.font.css['font-family']) {
				faces = that.font.css['font-family'].split(/,/);

				$.each(faces, function (index, face) {
					face = $.trim(face.replace(/^(['"])(.*)\1$/, '$2'));
					$.each(that.options.families, function (index, family) {
						if (face == family.name) {
							that.font.css['font-family'] = family.faces;
							found = true;
							return !found;
						}
					});
					return !found;
				});
			}
		},

		setFont: function (text) {
			this._setFont(text);
			this._change(this.font.set);
		},

		_effectGeneric: function (show, slide, fade, callback) {
			var that = this;

			if ($.effects && $.effects[that.options.showAnim]) {
				that.dialog[show](that.options.showAnim, that.options.showOptions, that.options.duration, callback);
			} else {
				that.dialog[(that.options.showAnim === 'slideDown' ?
						slide
						: (that.options.showAnim === 'fadeIn' ?
								fade
								: show))]((that.options.showAnim ? that.options.duration : null), callback);
				if (!that.options.showAnim || !that.options.duration) {
					callback();
				}
			}
		},

		_effectShow: function (callback) {
			this._effectGeneric('show', 'slideDown', 'fadeIn', callback);
		},

		_effectHide: function (callback) {
			this._effectGeneric('hide', 'slideUp', 'fadeOut', callback);
		},

		_generate: function () {
			var that = this,
					index,
					part,
					parts_list;

			// Determine the parts to include in this fontpicker
			if (typeof that.options.parts === 'string') {
				if (that.options.parts in $.fontpicker.partslists) {
					parts_list = $.fontpicker.partslists[that.options.parts];
				} else {
					// automatic
					parts_list = $.fontpicker.partslists[that.inline ? 'inline' : 'popup'];
				}
			} else {
				parts_list = that.options.parts;
			}

			// Add any parts to the internal parts list
			that.parts = {};
			$.each(parts_list, function (index, part) {
				if ($.fontpicker.parts[part]) {
					that.parts[part] = new $.fontpicker.parts[part](that);
				}
			});

			if (!that.generated) {
				var layout_parts = [];

				$.each(that.options.layout, function (part, pos) {
					if (that.parts[part]) {
						layout_parts.push({
							'part': part,
							'pos': pos
						});
					}
				});

				$(_layoutTable(layout_parts, function (cell, x, y) {
					var classes = ['ui-fontpicker-' + cell.part + '-container'];

					if (x > 0) {
						classes.push('ui-fontpicker-padding-left');
					}

					if (y > 0) {
						classes.push('ui-fontpicker-padding-top');
					}

					return '<td class="' + classes.join(' ') + '"'
							+ (cell.pos[2] > 1 ? ' colspan="' + cell.pos[2] + '"' : '')
							+ (cell.pos[3] > 1 ? ' rowspan="' + cell.pos[3] + '"' : '')
							+ ' valign="top"></td>';
				})).appendTo(that.dialog).addClass('ui-dialog-content ui-widget-content');

				that._initAllParts();
				that._updateAllParts();
				that.generated = true;
			}
		},

		open: function () {
			var that = this,
					offset,
					bottom,
					right,
					height,
					width,
					x,
					y,
					zIndex,
					source = '';

			if (!that.opened) {
				switch (that.source) {
					case 'val':
						source = that.element.val();
						break;
					case 'css':
						source = that.element;
						break;
					default:
						source = that.options.font;
						break;
				}
				that._setFont(source);

				that.previousFont = that.font.copy();

				that._callback('init');

				that._generate();

				offset = that.element.offset();
				bottom = $(window).height() + $(window).scrollTop();
				right = $(window).width() + $(window).scrollLeft();
				height = that.dialog.outerHeight();
				width = that.dialog.outerWidth();
				x = offset.left;
				y = offset.top + that.element.outerHeight();

				if (x + width > right) {
					x = Math.max(0, right - width);
				}

				if (y + height > bottom) {
					if (offset.top - height >= $(window).scrollTop()) {
						y = offset.top - height;
					} else {
						y = Math.max(0, bottom - height);
					}
				}

				that.dialog.css({'left': x, 'top': y});

				// Automatically find highest z-index.
				zIndex = 0;
				$(that.element[0]).parents().each(function () {
					var z = $(this).css('z-index');
					if ((typeof (z) === 'number' || typeof (z) === 'string') && z !== '' && !isNaN(z)) {
						zIndex = z;
						return false;
					}
				});

				//@todo zIndexOffset option, to raise above other elements?
				that.dialog.css('z-index', zIndex += 2);

				that.overlay = that.options.modal ? new $.ui.dialog.overlay(that) : null;

				that._effectShow();
				that.opened = true;

				// Without waiting for domready the width of the map is 0 and we
				// wind up with the cursor stuck in the upper left corner
				$(function () {
					that._repaintAllParts();
				});
			}
		},

		close: function () {
			var that = this;

			if (that.opened) {
				that.previousFont = that.font.copy();
				that.changed = false;		//@todo on open instead?

				// tear down the interface
				that._effectHide(function () {
					that.dialog.empty();
					that.generated = false;

					that.opened = false;
					that._callback('close');
				});

				if (that.overlay) {
					that.overlay.destroy();
				}
			}
		},

		destroy: function () {
			this.element.unbind();

			if (this.image !== null) {
				this.image.remove();
			}

			if (this.button !== null) {
				this.button.remove();
			}

			if (this.dialog !== null) {
				this.dialog.remove();
			}

			if (this.overlay) {
				this.overlay.destroy();
			}
		},

		_callback: function (callback) {
			var that = this;

			if (that.font.set) {
				that._trigger(callback, null, {
					style: that.font.toCSS(),
					css: that.font.css
				});
			} else {
				that._trigger(callback, null, {
					style: '',
					css: {}
				});
			}
		},

		_initAllParts: function () {
			$.each(this.parts, function (index, part) {
				if (part.init) {
					part.init();
				}
			});
		},

		_updateAllParts: function () {
			$.each(this.parts, function (index, part) {
				if (part.update) {
					part.update();
				}
			});
		},

		_repaintAllParts: function () {
			$.each(this.parts, function (index, part) {
				if (part.repaint) {
					part.repaint();
				}
			});
		},

		_change: function (set /* = true */) {
			this.font.set = (set !== false);

			this.changed = true;

			// update input element content
			if (!this.inline) {		//@todo if input, if style, output style
				if (!this.font.set) {
					this.element.val('');
				} else {
					var css = this.font.toCSS();
					if (this.element.val() != css) {
						this.element.val(css);
					}
				}

				this._setAltField();
			}

			if (this.opened) {
				this._repaintAllParts();
			}

			// callback
			this._callback('select');
		},

		// This will be deprecated by jQueryUI 1.9 widget
		_hoverable: function (e) {
			e.hover(function () {
				e.addClass("ui-state-hover");
			}, function () {
				e.removeClass("ui-state-hover");
			});
		},

		// This will be deprecated by jQueryUI 1.9 widget
		_focusable: function (e) {
			e.focus(function () {
				e.addClass("ui-state-focus");
			}).blur(function () {
				e.removeClass("ui-state-focus");
			});
		},

		_getRegional: function (name) {
			return $.fontpicker.regional[this.options.regional][name] !== undefined ?
					$.fontpicker.regional[this.options.regional][name] : $.fontpicker.regional[''][name];
		}
	});
}(jQuery));