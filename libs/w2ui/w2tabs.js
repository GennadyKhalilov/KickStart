/************************************************************************
*   Library: Web 2.0 UI for jQuery (using prototypical inheritance)
*   - Following objects defined
* 		- w2tabs 	- tabs widget
*		- $.w2tabs	- jQuery wrapper
*   - Dependencies: jQuery, w2utils
* 
************************************************************************/

(function () {
	var w2tabs = function (options) {
		this.box		= null;		// DOM Element that holds the element
		this.name		= null;		// unique name for w2ui
		this.active		= null;
		this.tabs		= [];
		this.right		= '';
		this.style		= '';
		this.onClick	= null;
		this.onRefresh	= null;
		this.onClose	= null;
		this.onRender	= null;
		
		$.extend(true, this, options);
	}
	
	// ====================================================
	// -- Registers as a jQuery plugin
	
	$.fn.w2tabs = function(method) {
		if (typeof method === 'object' || !method ) {
			// check required parameters
			if (!method || typeof method.name == 'undefined') {
				$.error('The parameter "name" is required but not supplied in $().w2tabs().');
				return;
			}
			if (typeof w2ui[method.name] != 'undefined') {
				$.error('The parameter "name" is not unique. There are other objects already created with the same name (obj: '+ method.name +').');
				return;			
			}
			// extend tabs
			var tabs   = method.tabs;
			var object = new w2tabs(method);
			$.extend(object, { tabs: [], handlers: [] });
			for (var i in tabs) { object.tabs[i] = $.extend({}, w2tabs.prototype.tab, tabs[i]); }		
			if ($(this).length != 0) {
				object.box = $(this)[0];
				$(this).data('w2name', object.name);
				object.render();
			}
			// register new object
			w2ui[object.name] = object;
			return object;

		} else if (typeof $(this).data('w2name') != 'undefined') {
			var obj = w2ui[$(this).data('w2name')];
			obj[method].apply(obj, Array.prototype.slice.call(arguments, 1));
			return this;
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.w2tabs' );
		}    
	};
	
	// ====================================================
	// -- Implementation of core functionality
	
	w2tabs.prototype = {
		tab : {
			id: 			null,		// commnad to be sent to all event handlers
			caption: 		'',
			hidden: 		false,
			disabled: 		false,
			closable:		false,
			hint: 			'',
			onClick: 		null,
			onRefresh: 		null,
			onClose: 		null
		},
		
		add: function (options) {
			return this.insert(null, options);
		},
		
		insert: function (id, options) {
			if (!$.isArray(options)) options = [options];
			// assume it is array
			for (var r in options) {
				// checks
				if (String(options[r].id) == 'undefined') {
					$.error('The parameter "id" is required but not supplied. (obj: '+ this.name +')');
					return;
				}
				var unique = true;
				for (var i in this.tabs) { if (this.tabs[i].id == options[r].id) { unique = false; break; } }
				if (!unique) {
					$.error('The parameter "id='+ options[r].id +'" is not unique within the current tabs. (obj: '+ this.name +')');
					return;
				}
				if (!w2utils.isAlphaNumeric(options[r].id)) {
					$.error('The parameter "id='+ options[r].id +'" must be alpha-numeric + "-_". (obj: '+ this.name +')');
					return;
				}
				// add tab
				var tab = $.extend({}, tab, options[r]);
				if (id == null || typeof id == 'undefined') {
					this.tabs.push(tab);
				} else {
					var middle = this.getIndex(id);
					this.tabs = this.tabs.slice(0, middle).concat([tab], this.tabs.slice(middle));
				}		
				this.refresh(options[r].id);		
			}
		},
		
		remove: function (id) {
			var removed = 0;
			for (var a in arguments) {
				var tab = this.get(arguments[a]);
				if (!tab) return false;
				removed++;
				// remove from array
				this.tabs.splice(this.getIndex(tab.id), 1);
				// remove from screen
				$(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ tab.id).remove();
			}
			return removed;
		},
		
		set: function (id, options) {
			var tab = this.getIndex(id);
			if (tab == null) return false;
			$.extend(this.tabs[tab], options);
			this.refresh(id);
			return true;	
		},
		
		get: function (id) {
			var tab = null;
			for (var i in this.tabs) {
				if (this.tabs[i].id == id) { tab = this.tabs[i]; break; }
			}
			return tab;	
		},
		
		getIndex: function (id) {
			var index = null;
			for (var i in this.tabs) {
				if (this.tabs[i].id == id) { index = i; break; }
			}
			return index;
		},
		
		show: function (id) {
			var tab = this.get(id);
			if (!tab) return false;
			tab.hidden = false;
			this.refresh(tab.id);
			return true;
		},
		
		hide: function (id) {
			var tab = this.get(id);
			if (!tab) return false;
			tab.hidden = true;
			this.refresh(tab.id);
			return true;
		},
		
		enable: function (id) {
			var tab = this.get(id);
			if (!tab) return false;
			tab.disabled = false;
			this.refresh(tab.id);
			return true;
		},
		
		disable: function (id) {
			var tab = this.get(id);
			if (!tab) return false;
			tab.disabled = true;
			this.refresh(tab.id);
			return true;
		},
			
		refresh: function (id) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (String(id) == 'undefined') {
				// refresh all
				for (var i in this.tabs) this.refresh(this.tabs[i].id);
			}
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'refresh', target: (typeof id != 'undefined' ? id : this.name), tab: this.get(id) });	
			if (eventData.stop === true) return false;
			// create or refresh only one item
			var tab = this.get(id);
			if (tab == null) return;
			
			var jq_el   = $(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ tab.id);
			var tabHTML = (tab.closable ? '<div class="w2ui-tab-close" onclick="w2ui[\''+ this.name +'\'].doClose(\''+ tab.id +'\', event);"></div>' : '') +
						  '	<div class="w2ui-tab '+ (this.active == tab.id ? 'active' : '') +'" title="'+ tab.hint +'"'+
						  '		onclick="w2ui[\''+ this.name +'\'].doClick(\''+ tab.id +'\', event);">' + tab.caption + '</div>';
			if (jq_el.length == 0) {
				// does not exist - create it
				var addStyle = '';
				if (tab.hidden) { addStyle += 'display: none;'; }
				if (tab.disabled) { addStyle += 'opacity: 0.2; -moz-opacity: 0.2; -webkit-opacity: 0.2; filter:alpha(opacity=20);'; }
				html = '<td id="tabs_'+ this.name + '_tab_'+ tab.id +'" style="'+ addStyle +'" valign="middle">'+ tabHTML + '</td>';
				if (this.getIndex(id) != this.tabs.length-1 && $(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ this.tabs[parseInt(this.getIndex(id))+1].id).length > 0) {
					$(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ this.tabs[parseInt(this.getIndex(id))+1].id).before(html);
				} else {
					$(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_right').before(html);
				}
			} else {
				// refresh
				jq_el.html(tabHTML);
				if (tab.hidden) { jq_el.css('display', 'none'); }
							else { jq_el.css('display', ''); }
				if (tab.disabled) { jq_el.css({ 'opacity': '0.2', '-moz-opacity': '0.2', '-webkit-opacity': '0.2', 'filter': 'alpha(opacity=20)' }); }
							else { jq_el.css({ 'opacity': '1', '-moz-opacity': '1', '-webkit-opacity': '1', 'filter': 'alpha(opacity=100)' }); }
			}
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
		},
		
		render: function (box) {
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'render', target: this.name, box: box });	
			if (eventData.stop === true) return false;
			// default action
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			if (String(box) != 'undefined' && box != null) { 
				$(this.box).html(''); 
				this.box = box;
			}
			if (!this.box) return;
			// render all buttons
			$(this.box).html('');
			var html = '<div id="tabs_'+ this.name +'" class="w2ui-tabs" style="'+ this.style +'">'+
					   '	<table cellspacing="0" cellpadding="1" width="100%">'+
					   '		<tr><td width="100%" id="tabs_'+ this.name +'_right" align="right">'+ this.right +'</td></tr>'+
					   '	</table>'+
					   '</div>';
			$(this.box).append(html);
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh();
		},
		
		resize: function (width, height) {
			if (window.getSelection) window.getSelection().removeAllRanges(); // clear selection 
			// empty function
		},
	
		destroy: function () { 
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'destroy', target: this.name });	
			if (eventData.stop === true) return false;
			// clean up
			$(this.box).html('');
			delete w2ui[this.name];
			// event after
			this.trigger($.extend({ phase: 'after' }));	
		},
		
		// ===================================================
		// -- Internal Event Handlers
	
		doClick: function (id, event) {
			var tab = this.get(id);
			if (tab == null || tab.disabled) return false;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'click', target: id, tab: this.get(id), event: event });	
			if (eventData.stop === true) return false;
			// default action
			$(this.box).find('#tabs_'+ this.name +'_tab_'+ this.active +' .w2ui-tab').removeClass('active');
			this.active = tab.id;
			// event after
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh(id);
		},
		
		doClose: function(id, event) {
			var tab = this.get(id);
			if (tab == null || tab.disabled) return false;
			// event before
			var eventData = this.trigger({ phase: 'before', type: 'close', target: id, tab: this.get(id), event: event });	
			if (eventData.stop === true) return false;
			// default action
			var obj = this;
			$(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ tab.id).css({ '-webkit-transition': '.2s', opacity: '0' });
			setTimeout(function () {
				var width = $(obj.box).find('.w2ui-tabs #tabs_'+ obj.name +'_tab_'+ tab.id).width();
				$(obj.box).find('.w2ui-tabs #tabs_'+ obj.name +'_tab_'+ tab.id)
					.html('<div style="width: '+ width +'px; -webkit-transition: .2s"></div>')
					.find(':first-child').css('width', '1px');
			}, 200);
			setTimeout(function () {
				obj.remove(id);		
			}, 400);
			// event before
			this.trigger($.extend(eventData, { phase: 'after' }));
			this.refresh();
		},
		
		doInsert: function(id, options) {		
			var tab = this.get(id);
			if (tab == null) return;
			if (!$.isPlainObject(options)) return;
			// check for unique
			var unique = true;
			for (var i in this.tabs) { if (this.tabs[i].id == options.id) { unique = false; break; } }
			if (!unique) {
				$.error('The parameter "id='+ options.id +'" is not unique within the current tabs. (obj: '+ this.name +')');
				return;
			}
			// insert simple div
			var jq_el   = $(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ options.id);
			if (jq_el.length != 0) return; // already exists
			// measure width
			var tmp = '<div id="_tmp_tabs" class="w2ui-tabs" style="position: absolute; top: -1000px;">'+
				'<table cellspacing="0" cellpadding="1" width="100%"><tr>'+
				'<td id="_tmp_simple_tab" style="" valign="middle">'+
					(options.closable ? '<div class="w2ui-tab-close"></div>' : '') +
				'	<div class="w2ui-tab '+ (this.active == options.id ? 'active' : '') +'">'+ options.caption +'</div>'+
				'</td></tr></table>'+
				'</div>';
			$('body').append(tmp);
			// create dummy element
			tabHTML = '<div style="width: 1px; -webkit-transition: 0.2s;">&nbsp;</div>';
			var addStyle = '';
			if (options.hidden) { addStyle += 'display: none;'; }
			if (options.disabled) { addStyle += 'opacity: 0.2; -moz-opacity: 0.2; -webkit-opacity: 0.2; filter:alpha(opacity=20);'; }
			html = '<td id="tabs_'+ this.name +'_tab_'+ options.id +'" style="'+ addStyle +'" valign="middle">'+ tabHTML +'</td>';
			if (this.getIndex(id) != this.tabs.length && $(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ this.tabs[parseInt(this.getIndex(id))].id).length > 0) {
				$(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_tab_'+ this.tabs[parseInt(this.getIndex(id))].id).before(html);
			} else {
				$(this.box).find('.w2ui-tabs #tabs_'+ this.name +'_right').before(html);
			}
			// -- move
			var obj = this;
			setTimeout(function () { 
				var width = $('#_tmp_simple_tab').width();
				$('#_tmp_tabs').remove();
				$('#tabs_'+ obj.name +'_tab_'+ options.id + ' > div').css('width', width+'px'); 
			}, 1);
			setTimeout(function () {
				// insert for real
				obj.insert(id, options);
			}, 200);
		}
	}
	
	$.extend(w2tabs.prototype, $.w2event);
})();