/*jslint devel: true, bitwise: true, regexp: true, browser: true, confusion: true, unparam: true, eqeq: true, white: true, nomen: true, plusplus: true, maxerr: 50, indent: 4 */
/*globals jQuery */

/*
 * FontPicker
 *
 * Copyright (c) 2011-2012 Martijn W. van der Lee
 * Licensed under the MIT.
 *
 * Full-featured fontpicker for jQueryUI with full theming support.
 * Most images from jPicker by Christopher T. Tillman.
 * Sourcecode created from scratch by Martijn W. van der Lee.
 */

(function ($) {
	"use strict";

	$.fontpicker = new function() {
		this.regional = [];
		this.regional[''] =	{
			ok:				'OK',
			cancel:			'Cancel',
			none:			'None',
			button:			'Font',
			title:			'Pick a font',
			previewText:	'The quick brown fox jumps\nover the lazy dog.'
		};
	};

	var _container_popup = '<div class="ui-fontpicker ui-fontpicker-dialog ui-dialog ui-widget ui-widget-content ui-corner-all" style="display: none;"></div>',

		_container_inline = '<div class="ui-fontpicker ui-fontpicker-inline ui-dialog ui-widget ui-widget-content ui-corner-all"></div>',

		_parts_lists = {
			'full':		['header', 'family', 'style', 'size', 'settings', 'preview', 'footer'],
			'popup':	['family', 'style', 'size', 'settings', 'preview', 'footer'],
			'inline':	['family', 'style', 'size', 'settings', 'preview']
		},

		_fonts = {
			'Arial':				['Arial', 'Helvetica', 'sans-serif'],
			'Arial Black':			['Arial Black', 'Gadget', 'sans-serif'],
			'Comic Sans MS':		['Comic Sans MS', 'cursive', 'sans-serif'],
			'Courier New':			['Courier New', 'Courier', 'monospace'],
			'Georgia':				['Georgia', 'serif'],
			'Impact':				['Impact', 'Charcoal', 'sans-serif'],
			'Lucida Console':		['Lucida Console', 'Monaco', 'monospace'],
			'Lucida Sans Unicode':	['Lucida Sans Unicode', 'Lucida Grande', 'sans-serif'],
			'Palatino Linotype':	['Palatino Linotype', 'Book Antiqua', 'Palatino', 'serif'],
			'Tahoma':				['Tahoma', 'Geneva', 'sans-serif'],
			'Times New Roman':		['Times New Roman', 'Times', 'serif'],
			'Trebuchet MS':			['Trebuchet MS', 'Helvetica', 'sans-serif'],
			'Verdana':				['Verdana', 'Geneva', 'sans-serif'],
		},

		_styles = {
			'Normal':				['normal', 'normal'],
			'Bold':					['bold', 'normal'],
			'Italic':				['normal', 'italic'],
			'Bold italic':			['bold', 'italic']
		},

		_sizes = {
			'6px':				'6',
			'7px':				'7',
			'8px':				'8',
			'9px':				'9',
			'10px':				'10',
			'11px':				'11',
			'12px':				'12',
			'14px':				'14',
			'16px':				'16',
			'18px':				'18',
			'21px':				'21',
			'24px':				'24',
			'36px':				'36',
			'48px':				'48',
			'60px':				'60',
			'72px':				'72'
		},

		_is_numeric = function(value) {
			return (typeof(value) === 'number' || typeof(value) === 'string') && value !== '' && !isNaN(value);
		},

		_layoutTable = function(layout, callback) {
			var layout = layout.sort(function(a, b) {
					if (a.pos[1] == b.pos[1]) {
						return a.pos[0] - b.pos[0];
					}
					return a.pos[1] - b.pos[1];
				}),
				bitmap,
				x,
				y,
				width, height,
				columns, rows,
				index,
				cell,
				html;

			// Determine dimensions of the table
			width = 0;
			height = 0;
			for (index in layout) {
				width = Math.max(width, layout[index].pos[0] + layout[index].pos[2]);
				height = Math.max(height, layout[index].pos[1] + layout[index].pos[3]);
			}

			// Initialize bitmap
			bitmap = [];
			for (x = 0; x < width; ++x) {
				bitmap.push(new Array(height));
			}

			// Mark rows and columns which have layout assigned
			rows	= new Array(height);
			columns = new Array(width);
			for (index in layout) {
				// mark columns
				for (x = 0; x < layout[index].pos[2]; x += 1) {
					columns[layout[index].pos[0] + x] = true;
				}
				for (y = 0; y < layout[index].pos[3]; y += 1) {
					rows[layout[index].pos[1] + y] = true;
				}
			}

			// Generate the table
			html = '';
			cell = layout[index = 0];
			for (y = 0; y < height; ++y) {
				html += '<tr>';
				for (x = 0; x < width;) {
					if (cell !== undefined && x == cell.pos[0] && y == cell.pos[1]) {
						// Create a "real" cell
						var w,
							h;

						html += callback(cell, x, y);

						for (h = 0; h < cell.pos[3]; h +=1) {
							for (w = 0; w < cell.pos[2]; w +=1) {
								bitmap[x + w][y + h] = true;
							}
						}

						x += cell.pos[2];
						cell = layout[++index];
					} else {
						// Fill in the gaps
						var colspan = 0;
						var walked = false;

						while (x < width && bitmap[x][y] === undefined && (cell === undefined || y < cell.pos[1] || (y == cell.pos[1] && x < cell.pos[0]))) {
							if (columns[x] === true) {
								colspan += 1;
							}
							walked = true;
							x += 1;
						}

						if (colspan > 0) {
							html += '<td colspan="'+colspan+'"></td>';
						} else if (!walked) {
							x += 1;
						}
					}
				}
				html += '</tr>';
			}

			return '<table cellspacing="0" cellpadding="0" border="0"><tbody>' + html + '</tbody></table>';
		},

        _parts = {
            header: function (inst) {
                var that = this,
                    e = null,
                    _html;

                _html = function () {
                    var title = inst.options.title ? inst.options.title :  inst._getRegional('title');

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

                    close.click( function() {
                        inst.close()
                    });
                };

                this.update = function () {};

                this.repaint = function () {};
            },

            family: function (inst) {
                var that	= this,
                    e		= null,
                    _html;

                _html = function () {
                    var html = '<div><input class="ui-fontpicker-family-text" type="text"/></div>';
					html += '<div><select class="ui-fontpicker-family-select" size="8">';
					$.each(_fonts, function(index, faces) {
						html += '<option value="'+index+'">'+index+'</option>';
					});
					html += '</select></div>';
                    return '<div class="ui-fontpicker-family">'+html+'</div>';
                };

                this.init = function () {
                    e = $(_html()).appendTo($('.ui-fontpicker-family-container', inst.dialog));

					$('.ui-fontpicker-family-select', e).change( function() {
						inst.font.family = $(this).val();
						inst._change();
					});
                };

                this.update = function () {};

                this.repaint = function () {};
            },

            style: function (inst) {
                var that		= this,
                    e			= null,
                    _html;

                _html = function () {
                    var html = '<div><input class="ui-fontpicker-style-text" type="text"/></div>';
					html += '<div><select class="ui-fontpicker-style-select" size="8">';
					$.each(_styles, function(index) {
						html += '<option value="'+index+'">'+index+'</option>';
					});
					html += '</select></div>';
                    return '<div class="ui-fontpicker-style">'+html+'</div>';
                };

                this.init = function () {
                    e = $(_html()).appendTo($('.ui-fontpicker-style-container', inst.dialog));

					$('.ui-fontpicker-style-select', e).change( function() {
						var style = _styles[$(this).val()];
						inst.font.weight	= style[0];
						inst.font.style		= style[1];
						inst._change();
					});
                };

                this.update = function () {};

                this.repaint = function () {};
            },

            size: function (inst) {
                var that		= this,
                    e			= null,
                    _html;

                _html = function () {
				    var html = '<div><input class="ui-fontpicker-size-text" type="text"/></div>';
					html += '<div><select class="ui-fontpicker-size-select" size="8">';
					$.each(_sizes, function(index, size) {
						html += '<option value="'+index+'">'+size+'</option>';
					});
					html += '</select></div>';
                    return '<div class="ui-fontpicker-size">'+html+'</div>';
                };

                this.init = function () {
                    e = $(_html()).appendTo($('.ui-fontpicker-size-container', inst.dialog));

					$('.ui-fontpicker-size-select', e).change( function() {
						inst.font.size		= $(this).val();
						inst._change();
					});
                };

                this.update = function () {};

                this.repaint = function () {};
            },

            settings: function (inst) {
                var that		= this,
                    e			= null,
                    _html;

                _html = function () {
                    var html = '<div class="ui-fontpicker-settings"></div>';
                    return html;
                };

                this.init = function () {
                    e = $(_html()).appendTo($('.ui-fontpicker-settings-container', inst.dialog));
                };

                this.update = function () {};

                this.repaint = function () {};
            },

            preview: function (inst) {
                var that = this,
                    e = null,
                    _html;

                _html = function () {
					var text = inst.options.previewText;
					if (!text) {
						text = inst._getRegional('previewText');
					}
					text = text.replace('\n', '<br/>');

					var html = '<div class="ui-fontpicker-preview-text">'+text+'</div>';
                    var prev = '<div class="ui-fontpicker-preview">'+html+'</div>';
                    var inner = '<div class="ui-fontpicker-preview-inner">'+prev+'</div>';
                    var outer = '<div class="ui-fontpicker-preview-outer">'+inner+'</div>';

					return outer;
                };

                this.init = function () {
                    e = $(_html()).appendTo($('.ui-fontpicker-preview-container', inst.dialog));
                };

                this.repaint = function () {
					$('.ui-fontpicker-preview-text', e).attr('style', inst.font.toCSS(true));
				};

                this.update = function () {};
            },

            footer: function (inst) {
                var that = this,
                    e = null,
                    _html;

                _html = function () {
                    var html = '';

                    if (!inst.inline && inst.options.showNoneButton) {
                        html += '<div class="ui-fontpicker-buttonset">';

                        if (!inst.inline && inst.options.showNoneButton) {
                            html += '<input type="radio" name="ui-fontpicker-special" id="ui-fontpicker-special-none"><label for="ui-fontpicker-special-none">' + inst._getRegional('none') + '</label>';
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
                        inst.font = $.extend({}, inst.currentFont);
                        inst._change(inst.font.set);
                        inst.close();
                    });

                    $('.ui-fontpicker-buttonset', e).buttonset();

                    $('#ui-fontpicker-special-none', e).click(function () {
                        inst._change(false);
                    });
                };

                this.repaint = function () {};

                this.update = function () {};
            }
        },

        Font = function () {
			this.copy = function () {
				return $.extend({}, this);
			};

			this.toCSS = function() {
				var parts = {};

				switch (this.style) {
					case 'italic':
					case 'oblique':
						parts['font-style'] = this.style;
						break;
				}

				if (this.smallcaps) {
					parts['font-variant'] = 'small-caps';
				}

				switch (this.weight) {
					case 'bold':
					case 'bolder':
					case 'lighter':
						parts['font-weight'] = this.weight;
						break;
				}

				if (this.size) {
					parts['font-size'] = _is_numeric(this.size)? this.size+'px' : this.size;
				}

				if (this.lineHeight) {
					parts['line-height'] = _is_numeric(this.lineHeight)? this.lineHeight+'px' : this.lineHeight;
				}

				if (this.family) {
					var faces = [];
					$.each(_fonts[this.family], function(index, face) {
						faces.push(/^\S+$/.test(face)? face : '"'+face+'"');
					});
					if (faces.length > 0) {
						parts['font-family'] = faces.join(',');
					}
				}

				if (parts['font-family'] && parts['font-size']) {
					var css = '';

					//@todo combine font-size/line-height
					if (parts['line-height']) {
						if (parts['font-size']) {
							parts['font-size'] += '/'+parts['line-height'];
						} else {
							css = 'line-height:'+parts['line-height']+';';
							parts['line-height'] = null;
						}
					}

					var array = [];
					$.each(parts, function(index, part) {
						array.push(part);
					});
					css += 'font:'+array.join(' ')+';';
					return css;
				} else {
					var css = '';
					$.each(parts, function(tag, value) {
						css += tag+':'+value+';';
					});
					return css;
				}
			};

		/*

font-style				Specifies the font style. See font-style for possible values
	normal
	italic
	oblique
font-variant			Specifies the font variant. See font-variant for possible values
	normal
	small-caps
font-weight				Specifies the font weight. See font-weight for possible values
	normal	Defines normal characters. This is default
	bold	Defines thick characters
	bolder	Defines thicker characters
	lighter	Defines lighter characters
	100
	200
	300
	400
	500
	600
	700
	800
	900
font-size/line-height	Specifies the font size and the line-height. See font-size and line-height for possible values
	i.e. 2em/111%;
	font-size
		xx-small	Sets the font-size to an xx-small size
		x-small	Sets the font-size to an extra small size
		small	Sets the font-size to a small size
		medium	Sets the font-size to a medium size. This is default
		large	Sets the font-size to a large size
		x-large	Sets the font-size to an extra large size
		xx-large	Sets the font-size to an xx-large size
		smaller	Sets the font-size to a smaller size than the parent element
		larger	Sets the font-size to a larger size than the parent element
		length	Sets the font-size to a fixed size in px, cm, etc.
		%	Sets the font-size to a percent of  the parent element's font size
	line-height
		normal	A normal line height. This is default
		number	A number that will be multiplied with the current font size to set the line height
		length	A fixed line height in px, pt, cm, etc.
		%
font-family				Specifies the font family. See font-family for possible values
	comma-separated prioritized list of font families.
	"serif", "sans-serif", "cursive", "fantasy", "monospace"

		*/

			this.set		= false;

			this.family		= '';
			this.weight		= 'normal';	// normal, bold, bolder, lighter
			this.style		= 'normal';	// normal, italic, oblique
			this.smallcaps	= false;
			this.size		= null;		// pixels
			this.lineHeight	= null;		// percentage
		};

	$.widget("vanderlee.fontpicker", {
		options: {
			altField:			'',			// selector for DOM elements which change background color on change.
			altOnChange:		true,		// true to update on each change, false to update only on close.
			autoOpen:			false,		// Open dialog automatically upon creation
			buttonImage:		'images/ui-fontpicker.png',
			buttonImageOnly:	false,
			buttonText:			null,		// Text on the button and/or title of button image.
			closeOnEscape:		true,		// Close the dialog when the escape key is pressed.
			closeOnOutside:		true,		// Close the dialog when clicking outside the dialog (not for inline)
			duration:			'fast',
			regional:			'',
			layout: {
				family:		[0, 0, 1, 1],	// Left, Top, Width, Height (in table cells).
				style:		[1, 0, 1, 1],
				size:       [2, 0, 1, 1],
				settings:	[0, 1, 3, 1],
				preview:	[0, 2, 3, 1]
			},
			parts:				'',			// leave empty for automatic selection
			showAnim:			'fadeIn',
			showNoneButton:		false,
			showOn:				'focus',	// 'focus', 'button', 'both'
			showOptions:		{},
			title:				null,
			zIndex:				null,
			previewText:		null,

			close:              null,
			select:             null
		},

		_create: function () {
			var that = this;

			that.widgetEventPrefix = 'font';

			that.opened		= false;
			that.generated	= false;
			that.inline		= false;
			that.changed	= false;

			that.dialog		= null;
			that.button		= null;
			that.image		= null;

			that.mode		= that.options.mode;

			if (this.element[0].nodeName.toLowerCase() === 'input') {
				that._setFont(that.element.val());

				$('body').append(_container_popup);
				that.dialog = $('.ui-fontpicker:last');

				// Click outside/inside
				$(document).mousedown(function (event) {
					if (!that.opened || event.target === that.element[0]) {
						return;
					}

					// Check if clicked on any part of dialog
					if ($(event.target).parents('.ui-fontpicker').length > 0) {
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

				$(document).keydown(function (event) {
					if (event.keyCode == 27 && that.opened && that.options.closeOnEscape) {
						that.close();
					}
				});

				if (that.options.showOn === 'focus' || that.options.showOn === 'both') {
					that.element.focus(function () {
						that.open();
					});
				}
				if (that.options.showOn === 'button' || that.options.showOn === 'both') {
					if (that.options.buttonImage !== '') {
						var text = that.options.buttonText ? that.options.buttonText : that._getRegional('button');

						that.image = $('<img/>').attr({
							'src':		that.options.buttonImage,
							'alt':		text,
							'title':	text
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

				if (that.options.autoOpen) {
					that.open();
				}

				that.element.keydown(function (event) {
					if (event.keyCode === 9) {
						that.close();
					}
				}).keyup(function (event) {
					var rgb = _parseHex(that.element.val());
					if (rgb) {
						that.color = (rgb === false ? new Font() : new Font(rgb[0], rgb[1], rgb[2]));
						that._change();
					}
				});
			} else {
				that.inline = true;

				$(this.element).html(_container_inline);
				that.dialog = $('.ui-fontpicker', this.element);

				that._generate();

				that.opened = true;
			}

			return this;
		},

		destroy: function() {
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
		},

		_setOption: function(key, value){
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
		 * If an alternate field is specified, set it according to the current color.
		 */
		_setAltField: function () {
			console.log('hir');
			if (this.options.altOnChange && this.options.altField) {
				$(this.options.altField).attr('style', this.font.set? this.font.toCSS() : '');
			}
		},

		_setFont: function(text) {
			//@todo this.font = _parseFont(text); //@todo parseFont from text (css-like?) return Font object
            this.font = new Font();
			this.currentFont = $.extend({}, this.font);
		},

		setFont: function(text) {
			this._setFont(text);
			this._change(this.font.set);
		},

		_generate: function () {
			var that = this,
				index,
				part,
				parts_list;

			// Set color based on element?
			that._setFont(that.inline? that.options.font : that.element.val());

			// Determine the parts to include in this fontpicker
			if (typeof that.options.parts === 'string') {
				if (that.options.parts in _parts_lists) {
					parts_list = _parts_lists[that.options.parts];
				} else {
					// automatic
					parts_list = _parts_lists[that.inline ? 'inline' : 'popup'];
				}
			} else {
				parts_list = that.options.parts;
			}

			// Add any parts to the internal parts list
			that.parts = {};
			for (index in parts_list) {
				part = parts_list[index];
				if (part in _parts) {
					that.parts[part] = new _parts[part](that);
				}
			}

			if (!that.generated) {
				var layout_parts = [];

				for (index in that.options.layout) {
					if (index in that.parts) {
						layout_parts.push({
							part: index,
							pos: that.options.layout[index]
						});
					}
				}

				$(_layoutTable(layout_parts, function(cell, x, y) {
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

		_effectGeneric: function (show, slide, fade, callback) {
			var that = this;

			if ($.effects && $.effects[that.options.showAnim]) {
				that.dialog[show](that.options.showAnim, that.options.showOptions, that.options.duration, callback);
			} else {
				that.dialog[(that.options.showAnim === 'slideDown' ?
								slide
							:	(that.options.showAnim === 'fadeIn' ?
									fade
								:	show))]((that.options.showAnim ? that.options.duration : null), callback);
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

		open: function () {
			if (!this.opened) {
				if (this.options.zIndex) {
					this.dialog.css('z-index', this.options.zIndex);
				}

				this._generate();

				var offset = this.element.offset(),
					x = offset.left,
					y = offset.top + this.element.outerHeight();
				x -= Math.max(0, (x + this.dialog.width()) - $(window).width() + 20);
				y -= Math.max(0, (y + this.dialog.height()) - $(window).height() + 20);
				this.dialog.css({'left': x, 'top': y});

				this._effectShow();
				this.opened = true;

				var that = this;
				// Without waiting for domready the width of the map is 0 and we
				// wind up with the cursor stuck in the upper left corner
				$(function() {
					that._repaintAllParts();
				});
			}
		},

		close: function () {
			var that = this;

			this.currentFont	= $.extend({}, this.color);
			this.changed		= false;

			// tear down the interface
			this._effectHide(function () {
				if (that.options.zIndex) {
					that.dialog.css('z-index', '');
				}

				that.dialog.empty();
				that.generated	= false;

				that.opened		= false;
				that._callback('close');
			});
		},

		_callback: function (callback) {
			var that = this;

			if (that.font.set) {
				that._trigger(callback, null, {
					css:	that.font.toCSS(),
					family: that.font.family,
					weight: that.font.weight
				});
			} else {
				that._trigger(callback, null, {
					css:	'',
					family: '',
					weight: ''
				});
			}
		},

		_repaintAllParts: function () {
			$.each(this.parts, function (index, part) {
				if (part.repaint) {
					part.repaint();
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

		_initAllParts: function () {
			$.each(this.parts, function (index, part) {
				part.init();
			});
		},

		_change: function (set /* = true */) {
			this.font.set = (set !== false);

			this.changed = true;

			// update input element content
			if (!this.inline) {
				if (!this.font.set) {
					this.element.val('');
				} else {
					var css = this.font.toCSS();
					if (this.element.val() != css) {
						this.element.val(css);
					}
				}
			}

			this._setAltField();

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

		_getRegional: function(name) {
			return $.fontpicker.regional[this.options.regional][name] !== undefined ?
				$.fontpicker.regional[this.options.regional][name] : $.fontpicker.regional[''][name];
        }
	});

}(jQuery));