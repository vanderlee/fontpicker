/*jslint devel: true, bitwise: true, regexp: true, browser: true, confusion: true, unparam: true, eqeq: true, white: true, nomen: true, plusplus: true, maxerr: 50, indent: 4 */
/*globals define,jQuery,Font */

/*!
 * FontPicker
 *
 * Copyright (c) 2011-2016 Martijn W. van der Lee
 * Licensed under the MIT.
 */
/* Full-featured fontpicker for jQueryUI with full theming support.
 * Most images from jPicker by Christopher T. Tillman.
 * Sourcecode created from scratch by Martijn W. van der Lee.
 */
(function( factory ) {
	if (typeof define === "function" && define.amd ) {

		// AMD. Register as an anonymous module.
		define([
			"jquery"
		], factory);
	} else {

		// Browser globals
		factory(jQuery);
	}
}(function ($) {
	"use strict";

	var _fontpicker_index = 0,
	
		_container_popup = '<div class="ui-fontpicker ui-fontpicker-dialog ui-dialog ui-widget ui-widget-content ui-corner-all" style="display: none;"></div>',
		_container_inlineFrame = '<div class="ui-fontpicker ui-fontpicker-inline ui-dialog ui-widget ui-widget-content ui-corner-all"></div>',
		_container_inline = '<div class="ui-fontpicker ui-fontpicker-inline"></div>',

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
			'line-height': function (inst) {
				var that = this,
						id = 'ui-fontpicker-settings-lineheight';

				this.id = function () {
					return id;
				};

				this.paintTo = function (container) {
					$('<input id="' + id + '" step="5" min="0" max="9999" type="number" value="' + (inst.font.css['line-height'] ? parseInt(inst.font.css['line-height']) : '') + '"/>')
							.appendTo(container)
							.change(function () {
								var value = $(this).val();
								inst.font.css['line-height'] = value ? value + '%' : null;
								inst.font.set = true;								
								inst._change();
							}).after(inst._getRegional('unit-percentage'));
				};

				this.label = function () {
					return inst._getRegional('setting-line-height');
				};
			},

			'small-caps': function (inst) {
				var that = this,
						id = 'ui-fontpicker-settings-smallcaps';

				this.id = function () {
					return id;
				};

				this.paintTo = function (container) {
					$('<input id="' + id + '" type="checkbox"/>')
							.attr('checked', _hasWord(inst.font.css['font-variant'], 'small-caps'))
							.appendTo(container)
							.change(function () {
								inst.font.css['font-variant'] = $(this).is(':checked') ? 'small-caps' : null;
								inst.font.set = true;								
								inst._change();
							});
				};

				this.label = function () {
					return inst._getRegional('setting-small-caps');
				};
			},

			'underline': function (inst) {
				var that = this,
						id = 'ui-fontpicker-settings-underline';

				this.id = function () {
					return id;
				};

				this.paintTo = function (container) {
					$('<input id="' + id + '" type="checkbox"/>')
							.attr('checked', _hasWord(inst.font.css['text-decoration'], 'underline'))
							.appendTo(container)
							.change(function () {
								inst.font.css['text-decoration'] = _setWord(inst.font.css['text-decoration'], 'underline', $(this).is(':checked'));
								inst.font.set = true;								
								inst._change();
							});
				};

				this.label = function () {
					return inst._getRegional('setting-underline');
				};
			},

			'overline': function (inst) {
				var that = this,
						id = 'ui-fontpicker-settings-overline';

				this.id = function () {
					return id;
				};

				this.paintTo = function (container) {
					$('<input id="' + id + '" type="checkbox"/>')
							.attr('checked', _hasWord(inst.font.css['text-decoration'], 'overline'))
							.appendTo(container)
							.change(function () {
								inst.font.css['text-decoration'] = _setWord(inst.font.css['text-decoration'], 'overline', $(this).is(':checked'));
								inst.font.set = true;								
								inst._change();
							});
				};

				this.label = function () {
					return inst._getRegional('setting-overline');
				};
			},

			'line-through': function (inst) {
				var that = this,
						id = 'ui-fontpicker-settings-linethrough';

				this.id = function () {
					return id;
				};

				this.paintTo = function (container) {
					$('<input id="' + id + '" type="checkbox"/>')
							.attr('checked', _hasWord(inst.font.css['text-decoration'], 'line-through'))
							.appendTo(container)
							.change(function () {
								inst.font.css['text-decoration'] = _setWord(inst.font.css['text-decoration'], 'line-through', $(this).is(':checked'));
								inst.font.set = true;								
								inst._change();
							});
				};

				this.label = function () {
					return inst._getRegional('setting-line-through');
				};
			},

			'letter-spacing': function (inst) {
				var that = this,
						id = 'ui-fontpicker-settings-letterspacing',
						input = null;

				this.id = function () {
					return id;
				};

				this.paintTo = function (container) {
					$('<input id="' + id + '" min="-999" max="999" type="number" value="' + (inst.font.css['letter-spacing'] ? parseInt(inst.font.css['letter-spacing']) : '') + '"/>')
							.appendTo(container)
							.change(function () {
								var value = $(this).val();
								inst.font.css['letter-spacing'] = value && value !== 0 ? value + 'px' : null;
								inst.font.set = true;								
								inst._change();
							}).after(inst._getRegional('unit-pixel'));
				};

				this.label = function () {
					return inst._getRegional('setting-letter-spacing');
				};
			}
		},
		
		_layoutTable = function (layout, callback) {
				var bitmap,
						x, y,
						width, height,
						columns, rows,
						index,
						cell,
						html,
						w, h,
						colspan,
						walked;

				layout.sort(function (a, b) {
					if (a.pos[1] === b.pos[1]) {
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
						if (typeof cell !== 'undefined' && x === cell.pos[0] && y === cell.pos[1]) {
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

							while (x < width && bitmap[x][y] === undefined && (cell === undefined || y < cell.pos[1] || (y === cell.pos[1] && x < cell.pos[0]))) {
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
			};

	$.fontpicker = new function () {
		this.regional = {
			'': {
				'ok': 'OK',
				'cancel': 'Cancel',
				'none': 'None',
				'button': 'Font',
				'title': 'Pick a font',
				'family': 'Family:',
				'style': 'Style:',
				'size': 'Size:',
				'unit-pixel': 'px',				
				'unit-percentage': '%',
				'settings-character': 'Character',
				'settings-paragraph': 'Paragraph',				
				'setting-line-height': 'Line height',
				'setting-letter-spacing': 'Letter spacing',
				'setting-small-caps': 'Small caps',
				'setting-underline': 'Underline',
				'setting-overline': 'Overline',
				'setting-line-through': 'Strike through',
				'preview': 'The quick brown fox jumps\nover the lazy dog.'
			}
		};

		this.families = {
			'default': [
				{	name: 'Arial',
					faces: ['Arial', 'Helvetica', 'sans-serif']
				},
				{	name: 'Arial Black',
					faces: ['Arial Black', 'Gadget', 'sans-serif']
				},
				{	name: 'Comic Sans MS',
					faces: ['Comic Sans MS', 'cursive', 'sans-serif']
				},
				{	name: 'Courier New',
					faces: ['Courier New', 'Courier', 'monospace']
				},
				{	name: 'Georgia',
					faces: ['Georgia', 'serif']
				},
				{	name: 'Impact',
					faces: ['Impact', 'Charcoal', 'sans-serif']
				},
				{	name: 'Lucida Console',
					faces: ['Lucida Console', 'Monaco', 'monospace']
				},
				{	name: 'Lucida Sans Unicode',
					faces: ['Lucida Sans Unicode', 'Lucida Grande', 'sans-serif']
				},
				{	name: 'Palatino Linotype',
					faces: ['Palatino Linotype', 'Book Antiqua', 'Palatino', 'serif']
				},
				{	name: 'Tahoma',
					faces: ['Tahoma', 'Geneva', 'sans-serif']
				},
				{	name: 'Times New Roman',
					faces: ['Times New Roman', 'Times', 'serif']
				},
				{	name: 'Trebuchet MS',
					faces: ['Trebuchet MS', 'Helvetica', 'sans-serif']
				},
				{	name: 'Verdana',
					faces: ['Verdana', 'Geneva', 'sans-serif']
				}
			]
		};

		this.partslists = {
			'full': ['header', 'family', 'style', 'size', 'settings', 'preview', 'footer'],
			'popup': ['family', 'style', 'size', 'settings', 'preview', 'footer'],
			'inline': ['family', 'style', 'size', 'settings', 'preview']
		};
		
		this.parts = {
			header: function (inst) {
				var that = this,
					part = null,
					_html = function () {
						var title = inst.options.title || inst._getRegional('title'),
							html = '<span class="ui-dialog-title">' + title + '</span>';
						
						if (!inst.inline && inst.options.showCloseButton) {
							html += '<a href="#" class="ui-dialog-titlebar-close ui-corner-all" role="button">'
								+ '<span class="ui-icon ui-icon-closethick">close</span></a>';
						}

						return '<div class="ui-dialog-titlebar ui-widget-header ui-corner-all ui-helper-clearfix">' + html + '</div>';
					},
					_onclick = function(event) {
						event.preventDefault();
						inst.close(inst.options.revert);
					};

				this.init = function () {
					part = $(_html()).prependTo(inst.dialog);
					
					var close = $('.ui-dialog-titlebar-close', part);
					inst._hoverable(close);
					inst._focusable(close);
					close.bind('click', _onclick);

					if (!inst.inline && inst.options.draggable) {
						var draggableOptions = {
							'handle': part
						};
						if (inst.options.containment) {
							draggableOptions.containment = inst.options.containment;
						}
						inst.dialog.draggable(draggableOptions);
					}
				};
				
				this.disable = function (disable) {
					$('.ui-dialog-titlebar-close', part)[disable ? 'unbind' : 'bind']('click', _onclick);
				};				
			},

			family: function (inst) {
				var that = this,
					part = null,
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
							if (family.name.toLowerCase() === name.toLowerCase()) {
								inst.font.css['font-family'] = family.faces;
								inst.font.set = true;
								inst._change();
								return false;	// break
							}
						});
					};

				this.init = function () {
					part = $(_html()).appendTo($('.ui-fontpicker-family-container', inst.dialog));

					$('.ui-fontpicker-family-text', part).on('change keyup', function () {
						_set($(this).val());
					});

					$('.ui-fontpicker-family-select', part).change(function () {
						_set($(this).val());
					});
				};

				this.repaint = function () {
					var face = inst.font.css['font-family'] ? inst.font.css['font-family'][0] : '';
					$.each(_families(), function (index, family) {
						if (family.faces === inst.font.css['font-family']) {
							$('.ui-fontpicker-family-text,.ui-fontpicker-family-select', part).not(':focus').val(face);
							return false;	// break
						}
					});
				};
			},

			style: function (inst) {
				var that = this,
					part = null,
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
							if (style.name.toLowerCase() === name.toLowerCase()) {
								inst.font.css['font-weight'] = style.weight === 'normal' ? null : style.weight;
								inst.font.css['font-style'] = style.style === 'normal' ? null : style.style;
								inst.font.set = true;								
								inst._change();
								return false;	// break
							}
						});
					};

				this.init = function () {
					part = $(_html()).appendTo($('.ui-fontpicker-style-container', inst.dialog));

					$('.ui-fontpicker-style-text', part).on('change keyup', function () {
						_set($(this).val());
					});

					$('.ui-fontpicker-style-select', part).change(function () {
						_set($(this).val());
					});
				};

				this.repaint = function () {
					var bold = inst.font.css['font-weight'] || 'normal',
						italic = inst.font.css['font-style'] || 'normal';
					$.each(inst.options.styles, function (index, style) {
						if (style.weight === bold && style.style === italic) {
							$('.ui-fontpicker-style-text,.ui-fontpicker-style-select', part).not(':focus').val(style.name);
							return false;	// break
						}
					});
				};
			},

			size: function (inst) {
				var that = this,
					part = null,
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
						inst.font.set = true;								
						inst._change();
					};

				this.init = function () {
					part = $(_html()).appendTo($('.ui-fontpicker-size-container', inst.dialog));

					$('.ui-fontpicker-size-text', part).on('change keyup', function () {
						_set($(this).val());
					});

					$('.ui-fontpicker-size-select', part).change(function () {
						_set($(this).val());
					});
				};

				this.repaint = function () {
					var size = inst.font.css['font-size'] ? parseInt(inst.font.css['font-size'], 10) : '';
					$('.ui-fontpicker-size-text,.ui-fontpicker-size-select', part).not(':focus').val(size);
				};
			},

			settings: function (inst) {
				var that = this,
					part = null,
					_html = function () {
						return '<div class="ui-fontpicker-settings"><ul/></div>';
					};

				this.init = function () {
					part = $(_html()).appendTo($('.ui-fontpicker-settings-container', inst.dialog));

					inst.settings = {};
					$.each(inst.options.settings, function (label, settings) {
						var columns = 3,
								id = 'ui-fontpicker-settings-' + label.toLowerCase() + '-' + inst.fontpicker_index,
								page = $('<div id="' + id + '"></div>').appendTo(part),
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

						$('ul', part).append('<li><a href="#' + id + '">' + inst._getRegional('settings-' + label) + '</a></li>');
					});

					part.tabs();
				};
			},

			preview: function (inst) {
				var that = this,
					part = null,
					_html = function () {
						var text = (inst.options.preview || inst._getRegional('preview')).replace('\n', '<br/>'),
							html = '<div class="ui-fontpicker-preview-text">' + text + '</div>',
							prev = '<div class="ui-fontpicker-preview">' + html + '</div>',
							inner = '<div class="ui-fontpicker-preview-inner">' + prev + '</div>',
							outer = '<div class="ui-fontpicker-preview-outer">' + inner + '</div>';

						return outer;
					};

				this.init = function () {
					part = $(_html()).appendTo($('.ui-fontpicker-preview-container', inst.dialog));
				};

				this.repaint = function () {
					$('.ui-fontpicker-preview-text', part).attr('style', inst.font.getCss(true));
				};
			},

			footer: function (inst) {
				var that = this,
					part = null,
					id_none = 'ui-fontpicker-special-none-' + inst.fontpicker_index,
					_html = function () {
						var html = '';

						if (!inst.inline && inst.options.showNoneButton) {
							html += '<div class="ui-fontpicker-buttonset">';

							if (!inst.inline && inst.options.showNoneButton) {
								html += '<input type="radio" name="ui-fontpicker-special" id="' + id_none + '" class="ui-fontpicker-special-none"><label for="' + id_none + '">' + inst._getRegional('none') + '</label>';
							}
							html += '</div>';
						}

						if (!inst.inline) {
							html += '<div class="ui-dialog-buttonset">';
							if (inst.options.showCancelButton) {
								html += '<button class="ui-fontpicker-cancel">' + inst._getRegional('cancel') + '</button>';
							}							
							html += '<button class="ui-fontpicker-ok">' + inst._getRegional('ok') + '</button>';
							html += '</div>';
						}

						return '<div class="ui-dialog-buttonpane ui-widget-content">' + html + '</div>';
					};

				this.init = function () {
					part = $(_html()).appendTo(inst.dialog);

					$('.ui-fontpicker-ok', part).button().click(function () {
						inst.close();
					});

					$('.ui-fontpicker-cancel', part).button().click(function () {
						inst.close(true);
					});

					$('.ui-fontpicker-buttonset', part)[$.fn.controlgroup ? 'controlgroup' : 'buttonset']();

					$('#' + id_none, part).click(function () {
						inst.font.set = false;
						inst._change();
					});
				};
				
				this.repaint = function () {
					if (!inst.font.set) {
						$('.ui-fontpicker-special-none', part).attr('checked', true).button('refresh');
					} else {
						$('input', part).attr('checked', false).button( "refresh" );
					}

					$('.ui-fontpicker-ok', part).button(inst.changed ? 'enable' : 'disable');
				};

				this.update = function () {};

				this.disable = function (disabled) {
					$(':input, :button', part).button(disabled ? 'disable' : 'enable');
					if (!disabled) {
						$('.ui-fontpicker-ok', part).button(inst.changed ? 'enable' : 'disable');
					}
				};				
			}
		};

		this.Font = function (style) {
			var objectToStyle = function (object) {
				var css = [
						'text-decoration',
						'font-weight',
						'font-style',
						'font-variant',
						'letter-spacing',
						'line-height',
						'font-family',
						'font-size',
						'color'
					],
					styles = [];

				$.each(css, function (index, name) {
					styles.push(name + ':' + object.css(name));
				});

				return styles.join(';');
			};

			this.set = false;

			this.css = {};
			
			this.equals = function(font) {
				if (font) {
					return this.set === font.set
						&& this.getCss() === font.getCss();
				}
				return false;
			};

			this.getCss = function () {
				var styles = [],
					parts;

				$.each(this.css, function (tag, value) {
					if (value !== null) {
						if ($.isArray(value)) {
							parts = [];
							$.each(value, function (index, part) {
								parts.push(/^\S+$/.test(part) ? part : '"' + part + '"');
							});
							if (parts.length > 0) {
								styles.push(tag + ':' + parts.join(','));
							}
						} else {
							styles.push(tag + ':' + value);
						}
					}
				});

				return styles.sort().join(';');				
			};

			this.copy = function () {
				var font = new $.fontpicker.Font(this.style);
				font.set = this.set;
				return font;
			};

			this.setCss = function (style) {
				var font = this,
					wrapper = $('<div>').appendTo('body'),
					item = $('<div style="' + style + '"/>').appendTo(wrapper),
					actual;

				// Compare-to-normal, unchanged
				$.each({
					'text-decoration': 'none',
					'font-weight': 'normal',
					'font-style': 'normal',
					'font-variant': 'normal',
					'letter-spacing': 'normal'
				}, function (tag, value) {
					wrapper.css(tag, value);
					actual = item.css(tag);
					if (actual !== value) {
						font.css[tag] = actual;
					}
				});

				// Compare-to-normal, percentage-to-fontsize
				$.each({
					'line-height': 'normal'
				}, function (tag, value) {
					wrapper.css(tag, value);
					actual = item.css(tag);
					if (actual !== value) {
						font.css[tag] = parseInt(parseInt(actual) * 100 / parseInt(item.css('font-size'))) + '%';
					}
				});

				// Detect non-change
				$.each({
					'font-family': ['sans-serif', 'serif'],
					'font-size': ['10px', '20px'],
					'color': ['black', 'white']
				}, function (tag, values) {
					wrapper.css(tag, values[0]);
					actual = item.css(tag);
					wrapper.css(tag, values[1]);
					if (actual === item.css(tag)) {
						font.css[tag] = actual;
					}
				});

				wrapper.remove();
			};

			// Construct
			if (typeof style === 'object' && style.jquery) {
				style = objectToStyle(style);
			}
			
			this.setCss(style);
		};
	};

	$.widget("vanderlee.fontpicker", {
		options: {
			altField:			'', // selector for DOM elements which matches changes.
			altOnChange:		true, // true to update on each change, false to update only on close.
			autoOpen:			false, // Open dialog automatically upon creation
			buttonImage:		'images/ui-fontpicker.png',
			buttonImageOnly:	false,
			buttonText:			null, // Text on the button and/or title of button image.
			closeOnEscape:		true, // Close the dialog when the escape key is pressed.
			closeOnOutside:		true, // Close the dialog when clicking outside the dialog (not for inline)
			duration:			'fast',
			families:			$.fontpicker.families.default,
			inlineFrame:		true,		// Show a border and background when inline.
			layout: {
				family: [0, 0, 1, 1], // Left, Top, Width, Height (in table cells).
				style: [1, 0, 1, 1],
				size: [2, 0, 1, 1],
				settings: [0, 1, 3, 1],
				preview: [0, 2, 3, 1]
			},
			modal:				false, // Modal dialog?
			nullable:			true,			
			parts:				'', // leave empty for automatic selection
			preview:			null,
			regional:			'',
			settings: {
				'character': [
					'letter-spacing',
					'small-caps',
					'underline',
					'overline',
					'line-through'
				],
				'paragraph': [
					'line-height'
				]
			},
			showAnim:			'fadeIn',
			showNoneButton:		false,
			showOn:				'focus click alt',		// 'focus', 'click', 'button', 'alt', 'all'
			showOptions:		{},
			sizes: [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 21, 24, 36, 48, 60, 72],
			styles: [
				{	name: 'Normal',
					weight: 'normal',
					style: 'normal'
				},
				{	name: 'Bold',
					weight: 'bold',
					style: 'normal'
				},
				{	name: 'Italic',
					weight: 'normal',
					style: 'italic'
				},
				{	name: 'Bold italic',
					weight: 'bold',
					style: 'italic'
				}
			],
			title:				null,

			cancel:             null,
            close:              null,
			init:				null,
            ok:                 null,
			open:               null,
			select:             null,
			stop:				null
		},

		_create: function () {
			var that = this;

			that.fontpicker_index = _fontpicker_index++;

			that.widgetEventPrefix = 'fontpicker';

			that.opened		= false;
			that.generated	= false;
			that.inline		= false;
			that.changed	= false;
			
			that.dialog		= null;
			that.button		= null;
			that.image		= null;
			that.overlay	= null;
			
			that.events = {
				window_resize:			null,
				document_keydown:		null,
				document_click_html:	null
			};

			if (that.element.is('input') || that.element.text() || that.options.inline === false) {
				// Initial font
				if (that.element.is('input')) {
					that.options.css = that.element.val();					
				} else if (that.element.text()) {
					that.options.css = that.element;										
				}
				that._setFont(that.options.css);
				
				that._callback('init');
				
				// showOn focus
				if (/\bfocus|all|both\b/.test(that.options.showOn)) {
					that.element.bind('focus', function () {
						that.open();
					});
				}
				if (/\bfocus|all|both\b/.test(that.options.hideOn)) {
					that.element.bind('focusout', function (e) {
						that.close();
					});
				}

				// showOn click
				if (/\bclick|all|both\b/.test(that.options.showOn)) {
					that.element.bind('click', function (e) {	
						if (that.opened && /\bclick|all|both\b/.test(that.options.hideOn)) {
							that.close();
						} else {
							that.open();
						}
					});
				}

				// showOn button
				if (/\bbutton|all|both\b/.test(that.options.showOn)) {
					if (that.options.buttonImage !== '') {
						var text = that.options.buttonText || that._getRegional('button');

						that.image = $('<img/>').attr({
							'src':		that.options.buttonImage,
							'alt':		text,
							'title':	text
						});
						if (that.options.buttonClass) {
							that.image.attr('class', that.options.buttonClass);
						}
					}

					if (that.options.buttonImageOnly && that.image) {
						that.button = that.image;
					} else {
						that.button = $('<button type="button"></button>').html(that.image || that.options.buttonText).button();
						that.image = that.image ? $('img', that.button).first() : null;
					}
					that.button.insertAfter(that.element).click(function () {
						if (that.opened && /\bbutton|all|both\b/.test(that.options.hideOn)) {
							that.close();
						} else {
							that.open();
						}
					});
				}

				// showOn alt
				if (/\balt|all|both\b/.test(that.options.showOn)) {					
					$(that.options.altField).bind('click', function () {
						if (that.opened && /\balt|all|both\b/.test(that.options.hideOn)) {
							that.close();
						} else {
							that.open();
						}
					});
				}

				if (that.options.autoOpen) {
					that.open();
				}

			} else {
				that.inline = true;

				that._generate();
				that.opened = true;
			}				

			// Disable Widget-style
			(that.element.is(':disabled') || that.options.disabled) && that.disable();

			return this;
		},

		_setOption: function(key, value) {
			switch (key) {
				case 'disabled':
					this[value ? 'disable' : 'enable']();
					break;
			}

			$.Widget.prototype._setOption.apply(this, arguments);
		},

		enable: function () {
			//$.Widget.prototype.enable.call(this);
			this.element && this.element.prop('disabled', false);
			this.button && this.button.prop('disabled', false);
			this.dialog && this.dialog.removeClass('ui-fontpicker-disabled');
			this.options.disabled = false;

			this.parts && $.each(this.parts, function (index, part) {
				part.disable && part.disable(false);
			});
		},
		
		disable: function () {
			//$.Widget.prototype.disable.call(this);
			this.element && this.element.prop('disabled', true);
			this.button && this.button.prop('disabled', true);
			this.dialog && this.dialog.addClass('ui-fontpicker-disabled');
			this.options.disabled = true;

			this.parts && $.each(this.parts, function (index, part) {
				part.disable && part.disable(true);
			});
		},

		_setAltField: function () {
			if (this.options.altOnChange && this.options.altField) {
				$(this.options.altField).attr('style', this.font.set ? this.font.getCss() : '');
			}
		},

		_setFont: function(css) {
			this.font			= this._parseFont(css) || new $.fontpickerFontColor();
			this.currentColor	= this.font.copy();			
			
			this._setAltField();
		},

		setFont: function(css) {
			this._setFont(css);
			this._change();
		},
		
		getFont: function() {
			return this.font.getCss();
		},
		
		_generateInline: function() {
			var that = this;

			$(that.element).html(that.options.inlineFrame ? _container_inlineFrame : _container_inline);

			that.dialog = $('.ui-fontpicker', that.element);
		},

		_generatePopup: function() {
			var that = this;

			that.dialog = $(_container_popup).appendTo('body');

			// Close on clicking outside window and controls
			if (that.events.document_click_html === null) {
				$(document).delegate('html', 'touchstart click', that.events.document_click_html = function (event) {
					if (!that.opened || event.target === that.element[0] || that.overlay) {
						return;
					}

					// Check if clicked on any part of dialog
					if (that.dialog.is(event.target) || that.dialog.has(event.target).length > 0) {
						that.element.blur();	// inside window!
						return;
					}

					// Check if clicked on known external elements
					var p,
						parents = $(event.target).parents();
					// add the event.target in case of buttonImageOnly and closeOnOutside both are set to true
					parents.push(event.target);
					for (p = 0; p <= parents.length; ++p) {
						// button
						if (that.button !== null && parents[p] === that.button[0]) {
							return;
						}
						// showOn alt
						if (/\balt|all|both\b/.test(that.options.showOn) && $(that.options.altField).is(parents[p])) {
							return;
						}
					}

					// no closeOnOutside
					if (!that.options.closeOnOutside) {
						return;
					}

					that.close(that.options.revert);
				});
			}

			if (that.events.document_keydown === null) {
				$(document).bind('keydown', that.events.document_keydown = function (event) {
					// close on ESC key
					if (that.opened && event.keyCode === 27 && that.options.closeOnEscape) {
						that.close(that.options.revert);
					}

					// OK on Enter key
					if (that.opened && event.keyCode === 13 && that.options.okOnEnter) {
						that.close();
					}
				});
			}

			// Close (with OK) on tab key in element
			that.element.keydown(function (event) {
				if (event.keyCode === 9) {
					that.close();
				}
			}).keyup(function (event) {
				var font = that._parseFont(that.element.val());
				if (font && !that.font.equals(font)) {
					that.font = font;
					that._change();
				}
			});
		},		

		_generate: function () {
			var that = this,
				index,
				part,
				parts_list,
				layout_parts,
				table,
				classes,
				css = that.options.css;

			// Initial font
			if (that.element.is('input')) {
				css = that.element.val();					
			} else if (that.element.text()) {
				css = that.element;										
			}
			that._setFont(css);

			that[that.inline ? '_generateInline' : '_generatePopup']();

			// Determine the parts to include in this fontpicker
			if (typeof that.options.parts === 'string') {
				if ($.fontpicker.partslists[that.options.parts]) {
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
				layout_parts = [];

				$.each(that.options.layout, function(part, pos) {
					if (that.parts[part]) {
						layout_parts.push({
							'part':	part,
							'pos':	pos
						});
					}
				});

				table = $(_layoutTable(layout_parts, function (cell, x, y) {
					classes = ['ui-fontpicker-' + cell.part + '-container'];

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
				})).appendTo(that.dialog);
				if (that.options.inlineFrame) {
					table.addClass('ui-dialog-content ui-widget-content');
				}

				that._initAllParts();
				that._updateAllParts();
				that.generated = true;
			}
		},
		
		_effectGeneric: function (element, show, slide, fade, callback) {
			var that = this;

			if ($.effects && $.effects[that.options.showAnim]) {
				element[show](that.options.showAnim, that.options.showOptions, that.options.duration, callback);
			} else {				
				element[(that.options.showAnim === 'slideDown' ?
								slide
							:	(that.options.showAnim === 'fadeIn' ?
									fade
								:	show))]((that.options.showAnim ? that.options.duration : null), callback);
				if (!that.options.showAnim || !that.options.duration) {
					callback();
				}
			}
		},

		_effectShow: function(element, callback) {
			this._effectGeneric(element, 'show', 'slideDown', 'fadeIn', callback);
		},

		_effectHide: function(element, callback) {
			this._effectGeneric(element, 'hide', 'slideUp', 'fadeOut', callback);
		},

		open: function() {
			var that = this,
				offset,
				bottom, right,
				height, width,
				x, y,
				zIndex,
				element,
				position;

			if (!that.opened) {
				that._generate();
				
				if (that.element.is(':hidden')) {
					element = $('<div/>').insertBefore(that.element);
				} else {
					element = that.element;
				}			
				
				if (that.element.is(':hidden')) {
					element.remove();
				}
				
				// Automatically find highest z-index.
				zIndex = 0;
				$(that.element[0]).parents().each(function() {
					var z = $(this).css('z-index');
					if ((typeof(z) === 'number' || typeof(z) === 'string') && z !== '' && !isNaN(z)) {
						if (z > zIndex) {
							zIndex = parseInt(z, 10);
							return false;
						}
					}
					else {
						$(this).siblings().each(function() {
							var z = $(this).css('z-index');
							if ((typeof(z) === 'number' || typeof(z) === 'string') && z !== '' && !isNaN(z)) {
								if (z > zIndex) {
									zIndex = parseInt(z, 10);
								}
							}
						});
					}
				});

				zIndex += 2;
				that.dialog.css('z-index', zIndex);
								
				if (that.options.modal) {
					that.overlay = $('<div class="ui-widget-overlay"></div>').appendTo('body').css('z-index', zIndex - 1);										

					if (that.events.window_resize !== null) {
						$(window).unbind('resize', that.events.window_resize);					
					}
					
					that.events.window_resize = function() {
						if (that.overlay) {
							that.overlay.width($(document).width());
							that.overlay.height($(document).height());					
						}
					},
															
					$(window).bind('resize', that.events.window_resize);
					that.events.window_resize();			
				}

				that._effectShow(this.dialog);

				if (that.options.position) {
					position = $.extend({}, that.options.position);
					if (position.of === 'element') {
						position.of = element;
					}
				} else {
					position = {
						my:			'left top',
						at:			'left bottom',
						of:			element,
						collision:	'flip'
					};
				}
				that.dialog.position(position);
				
				that.opened = true;
				that._callback('open', true);

				// Without waiting for domready the width of the map is 0 and we
				// wind up with the cursor stuck in the upper left corner
				$(function() {
					that._repaintAllParts();
				});
			}
		},
		
		close: function (cancel) {
			var that = this;

			if (!that.opened) {
				return;
			}				
				
            if (cancel) {
				that.font = that.currentFont.copy();
                that._change();
                that._callback('cancel', true);
            } else {
				that.currentFont	= that.font.copy();
                that._callback('ok', true);
            }
			that.changed		= false;

			if (that.overlay) {
				$(window).unbind('resize', that.events.window_resize);					
				that.overlay.remove();
			}
			
			// tear down the interface
			that._effectHide(that.dialog, function () {
				that.dialog.remove();
				that.dialog		= null;
				that.generated	= false;

				that.opened		= false;
				that._callback('close', true);
			});
		},		

		destroy: function () {
			var that = this;
			if (that.events.document_click_html !== null) {
				$(document).undelegate('html', 'touchstart click', that.events.document_click_html);
			}
			
			if (that.events.document_keydown !== null) {
				$(document).unbind('keydown', that.events.document_keydown);
			}
			
			if (that.events.resizeOverlay !== null) {
				$(window).unbind('resize', that.events.resizeOverlay);					
			}			
			
			this.element.unbind();

			if (this.overlay) {
				this.overlay.remove();
			}
			
			if (this.dialog !== null) {
				this.dialog.remove();
			}
			
			if (this.image !== null) {
				this.image.remove();
			}

			if (this.button !== null) {
				this.button.remove();
			}
		},

		_callback: function (callback) {
			var that = this;

			if (that.font.set) {
				return that._trigger(callback, null, {
					style: that.font.getCss(),
					css: that.font.css
				});
			} else {
				return that._trigger(callback, null, {
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

		_change: function (stoppedChanging /* = true */) {
			// Set changed if different from starting font
			this.changed = !this.font.equals(this.currentFont);
			
			// update input element content
			if (!this.inline) {
				if (!this.font.set) {
					if (this.element.val() !== '') {
						this.element.val('').change();
					}
				} else {
					var css = '';
					if (this.element.is('input')) {
						css = this.element.val();					
					} else if (this.element.text()) {
						css = this.element;										
					}
					if (!this.font.equals(this._parseFont(css))) {
						this.element.val(this.font.getCss()).change();
					}
				}
			}

			// Set the alt field
			this._setAltField();

			// update color option
			this.options.font = this.font.set ? this.font.getCss() : '';

			// Repaint
			if (this.opened) {
				this._repaintAllParts();
			}

			// callbacks
			this._callback('select');
			
			if (typeof stoppedChanging === 'undefined' ? true : !!stoppedChanging) {
				this._callback('stop');
			}
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
		},
		
		_parseFont: function(css) {
			var that = this,			
				font = new $.fontpicker.Font(css);
			
			if (font.css['font-family']) {
				var faces = font.css['font-family'].split(/,/),
					found = false;

				$.each(faces, function (index, face) {
					face = $.trim(face.replace(/^(['"])(.*)\1$/, '$2'));
					$.each(that.options.families, function (index, family) {
						if (face === family.name) {
							font.css['font-family'] = family.faces;
							found = true;
							return !found;
						}
					});
					return !found;
				});
			}
			
			return font;
        }
	});

	return $.vanderlee.fontpicker;
}));