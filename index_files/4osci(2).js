// source --> https://www.wealllove.com/wp-content/plugins/events-manager/includes/js/events-manager.js?ver=5.92 
jQuery(document).ready( function($){
	var load_ui_css = false; //load jquery ui css?
	/* Time Entry */
	$('#start-time').each(function(i, el){
		$(el).addClass('em-time-input em-time-start').next('#end-time').addClass('em-time-input em-time-end').parent().addClass('em-time-range');
	});
	if( $(".em-time-input").length > 0 ){
		em_setup_timepicker('body');
	}
	/* Calendar AJAX */
	$('.em-calendar-wrapper a').unbind("click");
	$('.em-calendar-wrapper a').undelegate("click");
	$('.em-calendar-wrapper').delegate('a.em-calnav, a.em-calnav', 'click', function(e){
		e.preventDefault();
		$(this).closest('.em-calendar-wrapper').prepend('<div class="loading" id="em-loading"></div>');
		var url = em_ajaxify($(this).attr('href'));
		$(this).closest('.em-calendar-wrapper').load(url, function(){$(this).trigger('em_calendar_load');});
	} );

	//Events Search
	$(document).delegate('.em-toggle', 'click change', function(e){
		e.preventDefault();
		//show or hide advanced tickets, hidden by default
		var el = $(this);
		var rel = el.attr('rel').split(':');
		if( el.hasClass('show-search') ){
			if( rel.length > 1 ){ el.closest(rel[1]).find(rel[0]).slideUp(); }
			else{ $(rel[0]).slideUp(); }
			el.find('.show, .show-advanced').show();
			el.find('.hide, .hide-advanced').hide();
			el.removeClass('show-search');
		}else{
			if( rel.length > 1 ){ el.closest(rel[1]).find(rel[0]).slideDown(); }
			else{ $(rel[0]).slideDown(); }
			el.find('.show, .show-advanced').hide();
			el.find('.hide, .hide-advanced').show();
			el.addClass('show-search');
		}
		
	});
	if( EM.search_term_placeholder ){
		if( 'placeholder' in document.createElement('input') ){
			$('input.em-events-search-text, input.em-search-text').attr('placeholder', EM.search_term_placeholder);
		}else{
			$('input.em-events-search-text, input.em-search-text').blur(function(){
				if( this.value=='' ) this.value = EM.search_term_placeholder;
			}).focus(function(){
				if( this.value == EM.search_term_placeholder ) this.value='';
			}).trigger('blur');
		}
	}
	$('.em-search-form select[name=country]').change( function(){
		var el = $(this);
		$('.em-search select[name=state]').html('<option value="">'+EM.txt_loading+'</option>');
		$('.em-search select[name=region]').html('<option value="">'+EM.txt_loading+'</option>');
		$('.em-search select[name=town]').html('<option value="">'+EM.txt_loading+'</option>');
		if( el.val() != '' ){
			el.closest('.em-search-location').find('.em-search-location-meta').slideDown();
			var data = {
				action : 'search_states',
				country : el.val(),
				return_html : true
			};
			$('.em-search select[name=state]').load( EM.ajaxurl, data );
			data.action = 'search_regions';
			$('.em-search select[name=region]').load( EM.ajaxurl, data );
			data.action = 'search_towns';
			$('.em-search select[name=town]').load( EM.ajaxurl, data );
		}else{
			el.closest('.em-search-location').find('.em-search-location-meta').slideUp();
		}
	});

	$('.em-search-form select[name=region]').change( function(){
		$('.em-search select[name=state]').html('<option value="">'+EM.txt_loading+'</option>');
		$('.em-search select[name=town]').html('<option value="">'+EM.txt_loading+'</option>');
		var data = {
			action : 'search_states',
			region : $(this).val(),
			country : $('.em-search-form select[name=country]').val(),
			return_html : true
		};
		$('.em-search select[name=state]').load( EM.ajaxurl, data );
		data.action = 'search_towns';
		$('.em-search select[name=town]').load( EM.ajaxurl, data );
	});

	$('.em-search-form select[name=state]').change( function(){
		$('.em-search select[name=town]').html('<option value="">'+EM.txt_loading+'</option>');
		var data = {
			action : 'search_towns',
			state : $(this).val(),
			region : $('.em-search-form select[name=region]').val(),
			country : $('.em-search-form select[name=country]').val(),
			return_html : true
		};
		$('.em-search select[name=town]').load( EM.ajaxurl, data );
	});
	
	//in order for this to work, you need the above classes to be present in your templates
	$(document).delegate('.em-search-form, .em-events-search-form', 'submit', function(e){
		var form = $(this);
    	if( this.em_search && this.em_search.value == EM.txt_search){ this.em_search.value = ''; }
    	var results_wrapper = form.closest('.em-search-wrapper').find('.em-search-ajax');
    	if( results_wrapper.length == 0 ) results_wrapper = $('.em-search-ajax');
    	if( results_wrapper.length > 0 ){
    		results_wrapper.append('<div class="loading" id="em-loading"></div>');
    		var submitButton = form.find('.em-search-submit');
    		submitButton.data('buttonText', submitButton.val()).val(EM.txt_searching);
    		var img = submitButton.children('img');
    		if( img.length > 0 ) img.attr('src', img.attr('src').replace('search-mag.png', 'search-loading.gif'));
    		var vars = form.serialize();
    		$.ajax( EM.ajaxurl, {
				type : 'POST',
	    		dataType : 'html',
	    		data : vars,
			    success : function(responseText){
			    	submitButton.val(submitButton.data('buttonText'));
			    	if( img.length > 0 ) img.attr('src', img.attr('src').replace('search-loading.gif', 'search-mag.png'));
		    		results_wrapper.replaceWith(responseText);
		        	if( form.find('input[name=em_search]').val() == '' ){ form.find('input[name=em_search]').val(EM.txt_search); }
		        	//reload results_wrapper
		        	results_wrapper = form.closest('.em-search-wrapper').find('.em-search-ajax');
		        	if( results_wrapper.length == 0 ) results_wrapper = $('.em-search-ajax');
			    	jQuery(document).triggerHandler('em_search_ajax', [vars, results_wrapper, e]); //ajax has loaded new results
			    }
	    	});
    		e.preventDefault();
			return false;
    	}
	});
	if( $('.em-search-ajax').length > 0 ){
		$(document).delegate('.em-search-ajax a.page-numbers', 'click', function(e){
			var a = $(this);
			var data = a.closest('.em-pagination').attr('data-em-ajax');
			var wrapper = a.closest('.em-search-ajax');
			var wrapper_parent = wrapper.parent();
		    var qvars = a.attr('href').split('?');
		    var vars = qvars[1];
		    //add data-em-ajax att if it exists
		    if( data != '' ){
		    	vars = vars != '' ? vars+'&'+data : data;
		    }
		    wrapper.append('<div class="loading" id="em-loading"></div>');
		    $.ajax( EM.ajaxurl, {
				type : 'POST',
	    		dataType : 'html',
	    		data : vars,
			    success : function(responseText) {
			    	wrapper.replaceWith(responseText);
			    	wrapper = wrapper_parent.find('.em-search-ajax');
			    	jQuery(document).triggerHandler('em_search_ajax', [vars, wrapper, e]); //ajax has loaded new results
			    }
	    	});
			e.preventDefault();
			return false;
		});
	}
		
	/*
	 * ADMIN AREA AND PUBLIC FORMS (Still polishing this section up, note that form ids and classes may change accordingly)
	 */
	//Events List
		//Approve/Reject Links
		$('.events-table').on('click', '.em-event-delete', function(){
			if( !confirm("Are you sure you want to delete?") ){ return false; }
			window.location.href = this.href;
		});
	//Forms
	$('#event-form #event-image-delete, #location-form #location-image-delete').on('click', function(){
		var el = $(this);
		if( el.is(':checked') ){
			el.closest('.event-form-image, .location-form-image').find('#event-image-img, #location-image-img').hide();
		}else{
			el.closest('.event-form-image, .location-form-image').find('#event-image-img, #location-image-img').show();
		}
	});
	//Event Editor 
		//Recurrence Warnings
		$('#event-form.em-event-admin-recurring').submit( function(event){
			var form = $(this);
			if( form.find('input[name="event_reschedule"]').first().val() == 1 ){
				var warning_text = EM.event_reschedule_warning;
			}else if( form.find('input[name="event_recreate_tickets"]').first().val() == 1 ){
				var warning_text = EM.event_recurrence_bookings;
			}else{
				var warning_text = EM.event_recurrence_overwrite;
			}
			confirmation = confirm(warning_text);
			if( confirmation == false ){
				event.preventDefault();
			}
		});
		//Buttons for recurrence warnings within event editor forms
		$('.em-reschedule-trigger').click(function(e){
			e.preventDefault();
			var trigger = $(this);
			trigger.closest('.em-recurrence-reschedule').find(trigger.data('target')).removeClass('reschedule-hidden');
			trigger.siblings('.em-reschedule-value').val(1);
			trigger.addClass('reschedule-hidden').siblings('a').removeClass('reschedule-hidden');
		});
		$('.em-reschedule-cancel').click(function(e){
			e.preventDefault();
			var trigger = $(this);
			trigger.closest('.em-recurrence-reschedule').find(trigger.data('target')).addClass('reschedule-hidden');
			trigger.siblings('.em-reschedule-value').val(0);
			trigger.addClass('reschedule-hidden').siblings('a').removeClass('reschedule-hidden');
		});
	//Tickets & Bookings
	if( $("#em-tickets-form").length > 0 ){
		//Enable/Disable Bookings
		$('#event-rsvp').click( function(event){
			if( !this.checked ){
				confirmation = confirm(EM.disable_bookings_warning);
				if( confirmation == false ){
					event.preventDefault();
				}else{
					$('#event-rsvp-options').hide();
				}
			}else{
				$('#event-rsvp-options').fadeIn();
			}
		});
		if($('input#event-rsvp').is(":checked")) {
			$("div#rsvp-data").fadeIn();
		} else {
			$("div#rsvp-data").hide();
		}
		//Ticket(s) UI
		var reset_ticket_forms = function(){
			$('#em-tickets-form table tbody tr.em-tickets-row').show();
			$('#em-tickets-form table tbody tr.em-tickets-row-form').hide();
		};
		//recurrences and cut-off logic for ticket availability
		if( $('#em-recurrence-checkbox').length > 0 ){
			$('#em-recurrence-checkbox').change(function(){
				if( $('#em-recurrence-checkbox').is(':checked') ){
					$('#em-tickets-form .ticket-dates-from-recurring, #em-tickets-form .ticket-dates-to-recurring, #event-rsvp-options .em-booking-date-recurring').show();
					$('#em-tickets-form .ticket-dates-from-normal, #em-tickets-form .ticket-dates-to-normal, #event-rsvp-options .em-booking-date-normal, #em-tickets-form .hidden').hide();
				}else{
					$('#em-tickets-form .ticket-dates-from-normal, #em-tickets-form .ticket-dates-to-normal, #event-rsvp-options .em-booking-date-normal').show();
					$('#em-tickets-form .ticket-dates-from-recurring, #em-tickets-form .ticket-dates-to-recurring, #event-rsvp-options .em-booking-date-recurring, #em-tickets-form .hidden').hide();
				}
			}).trigger('change');
		}else if( $('#em-form-recurrence').length > 0 ){
			$('#em-tickets-form .ticket-dates-from-recurring, #em-tickets-form .ticket-dates-to-recurring, #event-rsvp-options .em-booking-date-recurring').show();
			$('#em-tickets-form .ticket-dates-from-normal, #em-tickets-form .ticket-dates-to-normal, #event-rsvp-options .em-booking-date-normal, #em-tickets-form .hidden').hide();
		}else{
			$('#em-tickets-form .ticket-dates-from-recurring, #em-tickets-form .ticket-dates-to-recurring, #event-rsvp-options .em-booking-date-recurring, #em-tickets-form .hidden').hide();
		}
		//Add a new ticket
		$("#em-tickets-add").click(function(e){ 
			e.preventDefault();
			reset_ticket_forms();
			//create copy of template slot, insert so ready for population
			var tickets = $('#em-tickets-form table tbody');
			var rowNo = tickets.length+1;
			var slot = tickets.first().clone(true).attr('id','em-ticket-'+ rowNo).appendTo($('#em-tickets-form table'));
			//change the index of the form element names
			slot.find('*[name]').each( function(index,el){
				el = $(el);
				el.attr('name', el.attr('name').replace('em_tickets[0]','em_tickets['+rowNo+']'));
			});
			//show ticket and switch to editor
			slot.show().find('.ticket-actions-edit').trigger('click');
			//refresh datepicker and values
			slot.find('.em-date-input-loc').datepicker('destroy').removeAttr('id'); //clear all datepickers
			slot.find('.em-time-input').unbind().each(function(index, el){ this.timePicker = false; }); //clear all timepickers - consequently, also other click/blur/change events, recreate the further down
			em_setup_datepicker(slot);
			em_setup_timepicker(slot);
		    $('html, body').animate({ scrollTop: slot.offset().top - 30 }); //sends user to form
		});
		//Edit a Ticket
		$(document).delegate('.ticket-actions-edit', 'click', function(e){
			e.preventDefault();
			reset_ticket_forms();
			var tbody = $(this).closest('tbody');
			tbody.find('tr.em-tickets-row').hide();
			tbody.find('tr.em-tickets-row-form').fadeIn();
			return false;
		});
		$(document).delegate('.ticket-actions-edited', 'click', function(e){
			e.preventDefault();
			var tbody = $(this).closest('tbody');
			var rowNo = tbody.attr('id').replace('em-ticket-','');
			tbody.find('.em-tickets-row').fadeIn();
			tbody.find('.em-tickets-row-form').hide();
			tbody.find('*[name]').each(function(index,el){
				el = $(el);
				if( el.attr('name') == 'ticket_start_pub'){
					tbody.find('span.ticket_start').text(el.attr('value'));
				}else if( el.attr('name') == 'ticket_end_pub' ){
					tbody.find('span.ticket_end').text(el.attr('value'));
				}else if( el.attr('name') == 'em_tickets['+rowNo+'][ticket_type]' ){
					if( el.find(':selected').val() == 'members' ){
						tbody.find('span.ticket_name').prepend('* ');
					}
				}else if( el.attr('name') == 'em_tickets['+rowNo+'][ticket_start_recurring_days]' ){
					var text = tbody.find('select.ticket-dates-from-recurring-when').val() == 'before' ? '-'+el.attr('value'):el.attr('value');
					if( el.attr('value') != '' ){
						tbody.find('span.ticket_start_recurring_days').text(text);
						tbody.find('span.ticket_start_recurring_days_text, span.ticket_start_time').removeClass('hidden').show();
					}else{
						tbody.find('span.ticket_start_recurring_days').text(' - ');
						tbody.find('span.ticket_start_recurring_days_text, span.ticket_start_time').removeClass('hidden').hide();
					}
				}else if( el.attr('name') == 'em_tickets['+rowNo+'][ticket_end_recurring_days]' ){
					var text = tbody.find('select.ticket-dates-to-recurring-when').val() == 'before' ? '-'+el.attr('value'):el.attr('value');
					if( el.attr('value') != '' ){
						tbody.find('span.ticket_end_recurring_days').text(text);
						tbody.find('span.ticket_end_recurring_days_text, span.ticket_end_time').removeClass('hidden').show();
					}else{
						tbody.find('span.ticket_end_recurring_days').text(' - ');
						tbody.find('span.ticket_end_recurring_days_text, span.ticket_end_time').removeClass('hidden').hide();
					}
				}else{
					tbody.find('.'+el.attr('name').replace('em_tickets['+rowNo+'][','').replace(']','').replace('[]','')).text(el.attr('value'));
				}
			});
			//allow for others to hook into this
			$(document).triggerHandler('em_maps_tickets_edit', [tbody, rowNo, true]);
		    $('html, body').animate({ scrollTop: tbody.parent().offset().top - 30 }); //sends user back to top of form
			return false;
		});
		$(document).delegate('.em-ticket-form select.ticket_type','change', function(e){
			//check if ticket is for all users or members, if members, show roles to limit the ticket to
			var el = $(this);
			if( el.find('option:selected').val() == 'members' ){
				el.closest('.em-ticket-form').find('.ticket-roles').fadeIn();
			}else{
				el.closest('.em-ticket-form').find('.ticket-roles').hide();
			}
		});
		$(document).delegate('.em-ticket-form .ticket-options-advanced','click', function(e){
			//show or hide advanced tickets, hidden by default
			e.preventDefault();
			var el = $(this);
			if( el.hasClass('show') ){
				el.closest('.em-ticket-form').find('.em-ticket-form-advanced').fadeIn();
				el.find('.show,.show-advanced').hide();
				el.find('.hide,.hide-advanced').show();
			}else{
				el.closest('.em-ticket-form').find('.em-ticket-form-advanced').hide();
				el.find('.show,.show-advanced').show();
				el.find('.hide,.hide-advanced').hide();
			}
			el.toggleClass('show');
		});
		$('.em-ticket-form').each( function(){
			//check whether to show advanced options or not by default for each ticket
			var show_advanced = false;
			var el = $(this); 
			el.find('.em-ticket-form-advanced input[type="text"]').each(function(){ if(this.value != '') show_advanced = true; });
			if( el.find('.em-ticket-form-advanced input[type="checkbox"]:checked').length > 0 ){ show_advanced = true; }
			el.find('.em-ticket-form-advanced option:selected').each(function(){ if(this.value != '') show_advanced = true; });
			if( show_advanced ) el.find('.ticket-options-advanced').trigger('click');
		});
		//Delete a ticket
		$(document).delegate('.ticket-actions-delete', 'click', function(e){
			e.preventDefault();
			var el = $(this);
			var tbody = el.closest('tbody');
			if( tbody.find('input.ticket_id').val() > 0 ){
				//only will happen if no bookings made
				el.text('Deleting...');	
				$.getJSON( $(this).attr('href'), {'em_ajax_action':'delete_ticket', 'id':tbody.find('input.ticket_id').val()}, function(data){
					if(data.result){
						tbody.remove();
					}else{
						el.text('Delete');
						alert(data.error);
					}
				});
			}else{
				//not saved to db yet, so just remove
				tbody.remove();
			}
			return false;
		});
	}
	//Manageing Bookings
	if( $('#em-bookings-table').length > 0 ){
		//Pagination link clicks
		$(document).delegate('#em-bookings-table .tablenav-pages a', 'click', function(){
			var el = $(this);
			var form = el.parents('#em-bookings-table form.bookings-filter');
			//get page no from url, change page, submit form
			var match = el.attr('href').match(/#[0-9]+/);
			if( match != null && match.length > 0){
				var pno = match[0].replace('#','');
				form.find('input[name=pno]').val(pno);
			}else{
				form.find('input[name=pno]').val(1);
			}
			form.trigger('submit');
			return false;
		});
		//Overlay Options
		var em_bookings_settings_dialog = {
			modal : true,
			autoOpen: false,
			minWidth: 500,
			height: 'auto',
			buttons: [{
				text: EM.bookings_settings_save,
				click: function(e){
					e.preventDefault();
					//we know we'll deal with cols, so wipe hidden value from main
					var match = $("#em-bookings-table form.bookings-filter [name=cols]").val('');
					var booking_form_cols = $('form#em-bookings-table-settings-form input.em-bookings-col-item');
					$.each( booking_form_cols, function(i,item_match){
						//item_match = $(item_match);
						if( item_match.value == 1 ){
							if( match.val() != ''){
								match.val(match.val()+','+item_match.name);
							}else{
								match.val(item_match.name);
							}
						}
					});
					//submit main form
					$('#em-bookings-table-settings').trigger('submitted'); //hook into this with bind()
					$('#em-bookings-table form.bookings-filter').trigger('submit');					
					$(this).dialog('close');
				}
			}]
		};
		var em_bookings_export_dialog = {
			modal : true,
			autoOpen: false,
			minWidth: 500,
			height: 'auto',
			buttons: [{
				text: EM.bookings_export_save,
				click: function(e){
					$(this).children('form').submit();
					$(this).dialog('close');
				}
			}]
		};
		if( $("#em-bookings-table-settings").length > 0 ){
			//Settings Overlay
			$("#em-bookings-table-settings").dialog(em_bookings_settings_dialog);
			$(document).delegate('#em-bookings-table-settings-trigger','click', function(e){ e.preventDefault(); $("#em-bookings-table-settings").dialog('open'); });
			//Export Overlay
			$("#em-bookings-table-export").dialog(em_bookings_export_dialog);
			$(document).delegate('#em-bookings-table-export-trigger','click', function(e){ e.preventDefault(); $("#em-bookings-table-export").dialog('open'); });
			var export_overlay_show_tickets = function(){
				if( $('#em-bookings-table-export-form input[name=show_tickets]').is(':checked') ){
					$('#em-bookings-table-export-form .em-bookings-col-item-ticket').show();
					$('#em-bookings-table-export-form #em-bookings-export-cols-active .em-bookings-col-item-ticket input').val(1);
				}else{
					$('#em-bookings-table-export-form .em-bookings-col-item-ticket').hide().find('input').val(0);					
				}
			};
			//Sync export overlay with table search field changes
			$('#em-bookings-table form select').each(function(i, el){
				$(el).change(function(e){
					var select_el = $(this);
					var input_par = $('#em-bookings-table-export-form input[name='+select_el.attr('name')+']');
					var input_par_selected = select_el.find('option:selected');
					input_par.val(input_par_selected.val());
				});
			});
			
			export_overlay_show_tickets();
			$('#em-bookings-table-export-form input[name=show_tickets]').click(export_overlay_show_tickets);
			//Sortables
			$( ".em-bookings-cols-sortable" ).sortable({
				connectWith: ".em-bookings-cols-sortable",
				update: function(event, ui) {
					if( ui.item.parents('ul#em-bookings-cols-active, ul#em-bookings-export-cols-active').length > 0 ){							
						ui.item.addClass('ui-state-highlight').removeClass('ui-state-default').children('input').val(1);
					}else{
						ui.item.addClass('ui-state-default').removeClass('ui-state-highlight').children('input').val(0);
					}
				}
			}).disableSelection();
			load_ui_css = true;
		}
		//Widgets and filter submissions
		$(document).delegate('#em-bookings-table form.bookings-filter', 'submit', function(e){
			var el = $(this);			
			//append loading spinner
			el.parents('#em-bookings-table').find('.table-wrap').first().append('<div id="em-loading" />');
			//ajax call
			$.post( EM.ajaxurl, el.serializeArray(), function(data){
				var root = el.parents('#em-bookings-table').first();
				root.replaceWith(data);
				//recreate overlays
				$('#em-bookings-table-export input[name=scope]').val(root.find('select[name=scope]').val());
				$('#em-bookings-table-export input[name=status]').val(root.find('select[name=status]').val());
				jQuery(document).triggerHandler('em_bookings_filtered', [data, root, el]);
			});
			return false;
		});
		//Approve/Reject Links
		$(document).delegate('.em-bookings-approve,.em-bookings-reject,.em-bookings-unapprove,.em-bookings-delete', 'click', function(){
			var el = $(this); 
			if( el.hasClass('em-bookings-delete') ){
				if( !confirm(EM.booking_delete) ){ return false; }
			}
			var url = em_ajaxify( el.attr('href'));		
			var td = el.parents('td').first();
			td.html(EM.txt_loading);
			td.load( url );
			return false;
		});
	}
	//Old Bookings Table - depreciating soon
	if( $('.em_bookings_events_table').length > 0 ){
		//Widgets and filter submissions
		$(document).delegate('.em_bookings_events_table form', 'submit', function(e){
			var el = $(this);
			var url = em_ajaxify( el.attr('action') );		
			el.parents('.em_bookings_events_table').find('.table-wrap').first().append('<div id="em-loading" />');
			$.get( url, el.serializeArray(), function(data){
				el.parents('.em_bookings_events_table').first().replaceWith(data);
			});
			return false;
		});
		//Pagination link clicks
		$(document).delegate('.em_bookings_events_table .tablenav-pages a', 'click', function(){		
			var el = $(this);
			var url = em_ajaxify( el.attr('href') );	
			el.parents('.em_bookings_events_table').find('.table-wrap').first().append('<div id="em-loading" />');
			$.get( url, function(data){
				el.parents('.em_bookings_events_table').first().replaceWith(data);
			});
			return false;
		});
	}
	
	//Manual Booking
	$('a.em-booking-button').click(function(e){
		e.preventDefault();
		var button = $(this);
		if( button.text() != EM.bb_booked && $(this).text() != EM.bb_booking){
			button.text(EM.bb_booking);
			var button_data = button.attr('id').split('_'); 
			$.ajax({
				url: EM.ajaxurl,
				dataType: 'jsonp',
				data: {
					event_id : button_data[1],
					_wpnonce : button_data[2],
					action : 'booking_add_one'
				},
				success : function(response, statusText, xhr, $form) {
					if(response.result){
						button.text(EM.bb_booked);
					}else{
						button.text(EM.bb_error);					
					}
					if(response.message != '') alert(response.message);
				},
				error : function(){ button.text(EM.bb_error); }
			});
		}
		return false;
	});	
	$('a.em-cancel-button').click(function(e){
		e.preventDefault();
		var button = $(this);
		if( button.text() != EM.bb_cancelled && button.text() != EM.bb_canceling){
			button.text(EM.bb_canceling);
			var button_data = button.attr('id').split('_'); 
			$.ajax({
				url: EM.ajaxurl,
				dataType: 'jsonp',
				data: {
					booking_id : button_data[1],
					_wpnonce : button_data[2],
					action : 'booking_cancel'
				},
				success : function(response, statusText, xhr, $form) {
					if(response.result){
						button.text(EM.bb_cancelled);
					}else{
						button.text(EM.bb_cancel_error);
					}
				},
				error : function(){ button.text(EM.bb_cancel_error); }
			});
		}
		return false;
	});  

	//Datepicker
	if( $('.em-date-single, .em-date-range, #em-date-start').length > 0 ){
		load_ui_css = true;
		em_setup_datepicker('body');
	}
	if( load_ui_css ) em_load_jquery_css();
	
	//previously in em-admin.php
	function updateIntervalDescriptor () { 
		$(".interval-desc").hide();
		var number = "-plural";
		if ($('input#recurrence-interval').val() == 1 || $('input#recurrence-interval').val() == "")
		number = "-singular";
		var descriptor = "span#interval-"+$("select#recurrence-frequency").val()+number;
		$(descriptor).show();
	}
	function updateIntervalSelectors () {
		$('p.alternate-selector').hide();   
		$('p#'+ $('select#recurrence-frequency').val() + "-selector").show();
	}
	function updateShowHideRecurrence () {
		if( $('input#event-recurrence').is(":checked")) {
			$("#event_recurrence_pattern").fadeIn();
			$("#event-date-explanation").hide();
			$("#recurrence-dates-explanation").show();
			$("h3#recurrence-dates-title").show();
			$("h3#event-date-title").hide();     
		} else {
			$("#event_recurrence_pattern").hide();
			$("#recurrence-dates-explanation").hide();
			$("#event-date-explanation").show();
			$("h3#recurrence-dates-title").hide();
			$("h3#event-date-title").show();   
		}
	}		 
	$("#recurrence-dates-explanation").hide();
	$("#date-to-submit").hide();
	$("#end-date-to-submit").hide();
	
	$("#localised-date").show();
	$("#localised-end-date").show();
	
	$('#em-wrapper input.select-all').change(function(){
	 	if($(this).is(':checked')){
			$('input.row-selector').prop('checked', true);
			$('input.select-all').prop('checked', true);
	 	}else{
			$('input.row-selector').prop('checked', false);
			$('input.select-all').prop('checked', false);
		}
	}); 
	
	updateIntervalDescriptor(); 
	updateIntervalSelectors();
	updateShowHideRecurrence();
	$('input#event-recurrence').change(updateShowHideRecurrence);
	   
	// recurrency elements   
	$('input#recurrence-interval').keyup(updateIntervalDescriptor);
	$('select#recurrence-frequency').change(updateIntervalDescriptor);
	$('select#recurrence-frequency').change(updateIntervalSelectors);

	/* Load any maps */	
	if( $('.em-location-map').length > 0 || $('.em-locations-map').length > 0 || $('#em-map').length > 0 || $('.em-search-geo').length > 0 ){
		em_maps_load();
	}
	
	//Finally, add autocomplete here
	//Autocomplete
	if( jQuery( "div.em-location-data input#location-name" ).length > 0 ){
		jQuery( "div.em-location-data input#location-name" ).autocomplete({
			source: EM.locationajaxurl,
			minLength: 2,
			focus: function( event, ui ){
				jQuery("input#location-id" ).val( ui.item.value );
				return false;
			},			 
			select: function( event, ui ){
				jQuery("input#location-id" ).val(ui.item.id).trigger('change');
				jQuery("input#location-name" ).val(ui.item.value);
				jQuery('input#location-address').val(ui.item.address);
				jQuery('input#location-town').val(ui.item.town);
				jQuery('input#location-state').val(ui.item.state);
				jQuery('input#location-region').val(ui.item.region);
				jQuery('input#location-postcode').val(ui.item.postcode);
				if( ui.item.country == '' ){
					jQuery('select#location-country option:selected').removeAttr('selected');
				}else{
					jQuery('select#location-country option[value="'+ui.item.country+'"]').attr('selected', 'selected');
				}
				jQuery('div.em-location-data input, div.em-location-data select').css('background-color','#ccc').attr('readonly','readonly');
				jQuery('#em-location-reset').show();
				jQuery('#em-location-search-tip').hide();
				jQuery(document).triggerHandler('em_locations_autocomplete_selected', [event, ui]);
				return false;
			}
		}).data( "ui-autocomplete" )._renderItem = function( ul, item ) {
			html_val = "<a>" + em_esc_attr(item.label) + '<br><span style="font-size:11px"><em>'+ em_esc_attr(item.address) + ', ' + em_esc_attr(item.town)+"</em></span></a>";
			return jQuery( "<li></li>" ).data( "item.autocomplete", item ).append(html_val).appendTo( ul );
		};
		jQuery('#em-location-reset a').click( function(){
			jQuery('div.em-location-data input').css('background-color','#fff').val('').removeAttr('readonly');
			jQuery('div.em-location-data select').css('background-color','#fff');
			jQuery('div.em-location-data option:selected').removeAttr('selected');
			jQuery('input#location-id').val('');
			jQuery('#em-location-reset').hide();
			jQuery('#em-location-search-tip').show();
			jQuery('#em-map').hide();
			jQuery('#em-map-404').show();
			if(typeof(marker) !== 'undefined'){
				marker.setPosition(new google.maps.LatLng(0, 0));
				infoWindow.close();
				marker.setDraggable(true);
			}
			return false;
		});
		if( jQuery('input#location-id').val() != '0' && jQuery('input#location-id').val() != '' ){
			jQuery('div.em-location-data input, div.em-location-data select').css('background-color','#ccc').attr('readonly','readonly');
			jQuery('#em-location-reset').show();
			jQuery('#em-location-search-tip').hide();
		}
	}
	
});

function em_load_jquery_css(){
	if( EM.ui_css && jQuery('link#jquery-ui-css').length == 0 ){
		var script = document.createElement("link");
		script.id = 'jquery-ui-css';
		script.rel = "stylesheet";
		script.href = EM.ui_css;
		document.body.appendChild(script);
	}
}

function em_setup_datepicker(wrap){	
	wrap = jQuery(wrap);
	//default picker vals
	var datepicker_vals = { altFormat: "yy-mm-dd", changeMonth: true, changeYear: true, firstDay : EM.firstDay, yearRange:'-100:+10' };
	if( EM.dateFormat ) datepicker_vals.dateFormat = EM.dateFormat;
	if( EM.yearRange ) datepicker_vals.yearRange = EM.yearRange;
	jQuery(document).triggerHandler('em_datepicker', datepicker_vals);
	
	//apply datepickers
	dateDivs = wrap.find('.em-date-single, .em-date-range');
	if( dateDivs.length > 0 ){
		//apply datepickers to elements
		dateDivs.find('input.em-date-input-loc').each(function(i,dateInput){
			//init the datepicker
			var dateInput = jQuery(dateInput);
			var dateValue = dateInput.nextAll('input.em-date-input').first();
			var dateValue_value = dateValue.val();
			dateInput.datepicker(datepicker_vals);
			dateInput.datepicker('option', 'altField', dateValue);
			//now set the value
			if( dateValue_value ){
				var this_date_formatted = jQuery.datepicker.formatDate( EM.dateFormat, jQuery.datepicker.parseDate('yy-mm-dd', dateValue_value) );
				dateInput.val(this_date_formatted);
				dateValue.val(dateValue_value);
			}
			//add logic for texts
			dateInput.change(function(){
				if( jQuery(this).val() == '' ){
					jQuery(this).nextAll('.em-date-input').first().val('');
				}
			});
		});
		//deal with date ranges
		dateDivs.filter('.em-date-range').find('input.em-date-input-loc').each(function(i,dateInput){
			//finally, apply start/end logic to this field
			dateInput = jQuery(dateInput);
			if( dateInput.hasClass('em-date-start') ){
				dateInput.datepicker('option','onSelect', function( selectedDate ) {
					//get corresponding end date input, we expect ranges to be contained in .em-date-range with a start/end input element
					var startDate = jQuery(this);
					var endDate = startDate.parents('.em-date-range').find('.em-date-end').first();
					var startValue = startDate.nextAll('input.em-date-input').first().val();
					var endValue = endDate.nextAll('input.em-date-input').first().val();
					if( startValue > endValue && endValue != '' ){
						endDate.datepicker( "setDate" , selectedDate );
						endDate.trigger('change');
					}
					endDate.datepicker( "option", 'minDate', selectedDate );
				});
			}else if( dateInput.hasClass('em-date-end') ){
				var startInput = dateInput.parents('.em-date-range').find('.em-date-start').first();
				if( startInput.val() != '' ){
					dateInput.datepicker('option', 'minDate', startInput.val());
				}
			}
		});
	}
}

function em_setup_timepicker(wrap){
	wrap = jQuery(wrap);
	var timepicker_options = {
		show24Hours: EM.show24hours == 1,
		step:15
	}
	jQuery(document).triggerHandler('em_timepicker_options', timepicker_options);
	wrap.find(".em-time-input").timePicker(timepicker_options);
	
	// Keep the duration between the two inputs.
	wrap.find(".em-time-range input.em-time-start").each( function(i, el){
		jQuery(el).data('oldTime', jQuery.timePicker(el).getTime());
	}).change( function() {
		var start = jQuery(this);
		var end = start.nextAll('.em-time-end');
		if (end.val()) { // Only update when second input has a value.
		    // Calculate duration.
			var oldTime = start.data('oldTime');
		    var duration = (jQuery.timePicker(end).getTime() - oldTime);
		    var time = jQuery.timePicker(start).getTime();
		    if( jQuery.timePicker(end).getTime() >= oldTime ){
			    // Calculate and update the time in the second input.
			    jQuery.timePicker(end).setTime(new Date(new Date(time.getTime() + duration)));
			}
		    start.data('oldTime', time); 
		}
	});
	// Validate.
	wrap.find(".em-time-range input.em-time-end").change(function() {
		var end = jQuery(this);
		var start = end.prevAll('.em-time-start');
		if( start.val() ){
			if( jQuery.timePicker(start).getTime() > jQuery.timePicker(this).getTime() && ( jQuery('.em-date-end').val().length == 0 || jQuery('.em-date-start').val() == jQuery('.em-date-end').val() ) ) { end.addClass("error"); }
			else { end.removeClass("error"); }
		}
	});
	//Sort out all day checkbox
	wrap.find('.em-time-range input.em-time-all-day').change(function(){
		var allday = jQuery(this);
		if( allday.is(':checked') ){
			allday.siblings('.em-time-input').css('background-color','#ccc');
		}else{
			allday.siblings('.em-time-input').css('background-color','#fff');
		}
	}).trigger('change');
}

/* Useful function for adding the em_ajax flag to a url, regardless of querystring format */
var em_ajaxify = function(url){
	if ( url.search('em_ajax=0') != -1){
		url = url.replace('em_ajax=0','em_ajax=1');
	}else if( url.search(/\?/) != -1 ){
		url = url + "&em_ajax=1";
	}else{
		url = url + "?em_ajax=1";
	}
	return url;
};

/*
 * MAP FUNCTIONS
 */
var em_maps_loaded = false;
var maps = {};
var maps_markers = {};
var infoWindow;
//loads maps script if not already loaded and executes EM maps script
function em_maps_load(){
	if( !em_maps_loaded ){
		if ( jQuery('script#google-maps').length == 0 && ( typeof google !== 'object' || typeof google.maps !== 'object' ) ){ 
			var script = document.createElement("script");
			script.type = "text/javascript";
			script.id = "google-maps";
			var proto = (EM.is_ssl) ? 'https:' : 'http:';
			if( typeof EM.google_maps_api !== 'undefined' ){
				script.src = proto + '//maps.google.com/maps/api/js?v=3&libraries=places&callback=em_maps&key='+EM.google_maps_api;
			}else{
				script.src = proto + '//maps.google.com/maps/api/js?v=3&libraries=places&callback=em_maps';
			}
			document.body.appendChild(script);
		}else if( typeof google === 'object' && typeof google.maps === 'object' && !em_maps_loaded ){
			em_maps();
		}else if( jQuery('script#google-maps').length > 0 ){
			jQuery(window).load(function(){ if( !em_maps_loaded ) em_maps(); }); //google isn't loaded so wait for page to load resources
		}
	}
}
//re-usable function to load global location maps
function em_maps_load_locations(el){
	var el = jQuery(el);
	var map_id = el.attr('id').replace('em-locations-map-','');
	var em_data = jQuery.parseJSON( el.nextAll('.em-locations-map-coords').first().text() );
	if( em_data == null ){
		var em_data = jQuery.parseJSON( jQuery('#em-locations-map-coords-'+map_id).text() );
	}
	jQuery.getJSON(document.URL, em_data , function(data){
		if(data.length > 0){
			//define default options and allow option for extension via event triggers
			  var map_options = { mapTypeId: google.maps.MapTypeId.ROADMAP };
			  if( typeof EM.google_map_id_styles == 'object' && typeof EM.google_map_id_styles[map_id] !== 'undefined' ){ console.log(EM.google_map_id_styles[map_id]); map_options.styles = EM.google_map_id_styles[map_id]; }
			  else if( typeof EM.google_maps_styles !== 'undefined' ){ map_options.styles = EM.google_maps_styles; }
			  jQuery(document).triggerHandler('em_maps_locations_map_options', map_options);
			  var marker_options = {};
			  jQuery(document).triggerHandler('em_maps_location_marker_options', marker_options);
			  
			  maps[map_id] = new google.maps.Map(el[0], map_options);
			  maps_markers[map_id] = [];

			  var bounds = new google.maps.LatLngBounds();
			  
			  jQuery.map( data, function( location, i ){
				  if( !(location.location_latitude == 0 && location.location_longitude == 0) ){
					var latitude = parseFloat( location.location_latitude );
					var longitude = parseFloat( location.location_longitude );
					var location_position = new google.maps.LatLng( latitude, longitude );
					//extend the default marker options
					jQuery.extend(marker_options, {
					    position: location_position, 
					    map: maps[map_id]
					})
					var marker = new google.maps.Marker(marker_options);
					maps_markers[map_id].push(marker);
					marker.setTitle(location.location_name);
					var myContent = '<div class="em-map-balloon"><div id="em-map-balloon-'+map_id+'" class="em-map-balloon-content">'+ location.location_balloon +'</div></div>';
					em_map_infobox(marker, myContent, maps[map_id]);
					//extend bounds
					bounds.extend(new google.maps.LatLng(latitude,longitude))
				  }
			  });
			  // Zoom in to the bounds
			  maps[map_id].fitBounds(bounds);
			  
			//Call a hook if exists
			jQuery(document).triggerHandler('em_maps_locations_hook', [maps[map_id], data, map_id, maps_markers[map_id]]);
		}else{
			el.children().first().html('No locations found');
			jQuery(document).triggerHandler('em_maps_locations_hook_not_found', [el]);
		}
	});
}
function em_maps_load_location(el){
	el = jQuery(el);
	var map_id = el.attr('id').replace('em-location-map-','');
	em_LatLng = new google.maps.LatLng( jQuery('#em-location-map-coords-'+map_id+' .lat').text(), jQuery('#em-location-map-coords-'+map_id+' .lng').text());
	//extend map and markers via event triggers
	var map_options = {
	    zoom: 14,
	    center: em_LatLng,
	    mapTypeId: google.maps.MapTypeId.ROADMAP,
	    mapTypeControl: false,
	    gestureHandling: 'cooperative'
	};
	if( typeof EM.google_map_id_styles == 'object' && typeof EM.google_map_id_styles[map_id] !== 'undefined' ){ console.log(EM.google_map_id_styles[map_id]); map_options.styles = EM.google_map_id_styles[map_id]; }
	else if( typeof EM.google_maps_styles !== 'undefined' ){ map_options.styles = EM.google_maps_styles; }
	jQuery(document).triggerHandler('em_maps_location_map_options', map_options);
	maps[map_id] = new google.maps.Map( document.getElementById('em-location-map-'+map_id), map_options);
	var marker_options = {
	    position: em_LatLng,
	    map: maps[map_id]
	};
	jQuery(document).triggerHandler('em_maps_location_marker_options', marker_options);
	maps_markers[map_id] = new google.maps.Marker(marker_options);
	infoWindow = new google.maps.InfoWindow({ content: jQuery('#em-location-map-info-'+map_id+' .em-map-balloon').get(0) });
	infoWindow.open(maps[map_id],maps_markers[map_id]);
	maps[map_id].panBy(40,-70);
	
	//JS Hook for handling map after instantiation
	//Example hook, which you can add elsewhere in your theme's JS - jQuery(document).bind('em_maps_location_hook', function(){ alert('hi');} );
	jQuery(document).triggerHandler('em_maps_location_hook', [maps[map_id], infoWindow, maps_markers[map_id], map_id]);
	//map resize listener
	jQuery(window).on('resize', function(e) {
		google.maps.event.trigger(maps[map_id], "resize");
		maps[map_id].setCenter(maps_markers[map_id].getPosition());
		maps[map_id].panBy(40,-70);
	});
}
jQuery(document).bind('em_search_ajax', function(e, vars, wrapper){
	if( em_maps_loaded ){
		wrapper.find('.em-location-map').each( function(index, el){ em_maps_load_location(el); } );
		wrapper.find('.em-locations-map').each( function(index, el){ em_maps_load_locations(el); });
	}
});
//Load single maps (each map is treated as a seperate map).
function em_maps() {
	//Find all the maps on this page and load them
	jQuery('.em-location-map').each( function(index, el){ em_maps_load_location(el); } );	
	jQuery('.em-locations-map').each( function(index, el){ em_maps_load_locations(el); } );
	
	//Location stuff - only needed if inputs for location exist
	if( jQuery('select#location-select-id, input#location-address').length > 0 ){
		var map, marker;
		//load map info
		var refresh_map_location = function(){
			var location_latitude = jQuery('#location-latitude').val();
			var location_longitude = jQuery('#location-longitude').val();
			if( !(location_latitude == 0 && location_longitude == 0) ){
				var position = new google.maps.LatLng(location_latitude, location_longitude); //the location coords
				marker.setPosition(position);
				var mapTitle = (jQuery('input#location-name').length > 0) ? jQuery('input#location-name').val():jQuery('input#title').val();
				mapTitle = em_esc_attr(mapTitle);
				marker.setTitle( mapTitle );
				jQuery('#em-map').show();
				jQuery('#em-map-404').hide();
				google.maps.event.trigger(map, 'resize');
				map.setCenter(position);
				map.panBy(40,-55);
				infoWindow.setContent( 
					'<div id="location-balloon-content"><strong>' + mapTitle + '</strong><br>' + 
					em_esc_attr(jQuery('#location-address').val()) + 
					'<br>' + em_esc_attr(jQuery('#location-town').val()) + 
					'</div>'
				);
				infoWindow.open(map, marker);
				jQuery(document).triggerHandler('em_maps_location_hook', [map, infoWindow, marker, 0]);
			} else {
    			jQuery('#em-map').hide();
    			jQuery('#em-map-404').show();
			}
		};
		
		//Add listeners for changes to address
		var get_map_by_id = function(id){
			if(jQuery('#em-map').length > 0){
				jQuery.getJSON(document.URL,{ em_ajax_action:'get_location', id:id }, function(data){
					if( data.location_latitude!=0 && data.location_longitude!=0 ){
						loc_latlng = new google.maps.LatLng(data.location_latitude, data.location_longitude);
						marker.setPosition(loc_latlng);
						marker.setTitle( data.location_name );
						marker.setDraggable(false);
						jQuery('#em-map').show();
						jQuery('#em-map-404').hide();
						map.setCenter(loc_latlng);
						map.panBy(40,-55);
						infoWindow.setContent( '<div id="location-balloon-content">'+ data.location_balloon +'</div>');
						infoWindow.open(map, marker);
						google.maps.event.trigger(map, 'resize');
						jQuery(document).triggerHandler('em_maps_location_hook', [map, infoWindow, marker, 0]);
					}else{
						jQuery('#em-map').hide();
						jQuery('#em-map-404').show();
					}
				});
			}
		};
		jQuery('#location-select-id, input#location-id').change( function(){get_map_by_id(jQuery(this).val());} );
		jQuery('#location-name, #location-town, #location-address, #location-state, #location-postcode, #location-country').change( function(){
			//build address
			var addresses = [ jQuery('#location-address').val(), jQuery('#location-town').val(), jQuery('#location-state').val(), jQuery('#location-postcode').val() ];
			var address = '';
			jQuery.each( addresses, function(i, val){
				if( val != '' ){
					address = ( address == '' ) ? address+val:address+', '+val;
				}
			});
			if( address == '' ){ //in case only name is entered, no address
				jQuery('#em-map').hide();
				jQuery('#em-map-404').show();
				return false;
			}
			//do country last, as it's using the text version
			if( jQuery('#location-country option:selected').val() != 0 ){
				address = ( address == '' ) ? address+jQuery('#location-country option:selected').text():address+', '+jQuery('#location-country option:selected').text();
			}
			if( address != '' && jQuery('#em-map').length > 0 ){
				geocoder.geocode( { 'address': address }, function(results, status) {
				    if (status == google.maps.GeocoderStatus.OK) {
						jQuery('#location-latitude').val(results[0].geometry.location.lat());
						jQuery('#location-longitude').val(results[0].geometry.location.lng());
					}
				    refresh_map_location();
				});
			}
		});
		
		//Load map
		if(jQuery('#em-map').length > 0){
			var em_LatLng = new google.maps.LatLng(0, 0);
			var map_options = {
				    zoom: 14,
				    center: em_LatLng,
				    mapTypeId: google.maps.MapTypeId.ROADMAP,
				    mapTypeControl: false,
				    gestureHandling: 'cooperative'
			};
			if( typeof EM.google_maps_styles !== 'undefined' ){ map_options.styles = EM.google_maps_styles; }
			map = new google.maps.Map( document.getElementById('em-map'), map_options);
			var marker = new google.maps.Marker({
			    position: em_LatLng,
			    map: map,
			    draggable: true
			});
			infoWindow = new google.maps.InfoWindow({
			    content: ''
			});
			var geocoder = new google.maps.Geocoder();
			google.maps.event.addListener(infoWindow, 'domready', function() { 
				document.getElementById('location-balloon-content').parentNode.style.overflow=''; 
				document.getElementById('location-balloon-content').parentNode.parentNode.style.overflow=''; 
			});
			google.maps.event.addListener(marker, 'dragend', function() {
				var position = marker.getPosition();
				jQuery('#location-latitude').val(position.lat());
				jQuery('#location-longitude').val(position.lng());
				map.setCenter(position);
				map.panBy(40,-55);
			});
			if( jQuery('#location-select-id').length > 0 ){
				jQuery('#location-select-id').trigger('change');
			}else{
				refresh_map_location();
			}
			jQuery(document).triggerHandler('em_map_loaded', [map, infoWindow, marker]);
		}
		//map resize listener
		jQuery(window).on('resize', function(e) {
			google.maps.event.trigger(map, "resize");
			map.setCenter(marker.getPosition());
			map.panBy(40,-55);
		});
	}
	em_maps_loaded = true; //maps have been loaded
	jQuery(document).triggerHandler('em_maps_loaded');
}
  
function em_map_infobox(marker, message, map) {
  var iw = new google.maps.InfoWindow({ content: message });
  google.maps.event.addListener(marker, 'click', function() {
	if( infoWindow ) infoWindow.close();
	infoWindow = iw;
    iw.open(map,marker);
  });
}

function em_esc_attr( str ){
	if( typeof str !== 'string' ) return '';
	return str.replace(/</gi,'&lt;').replace(/>/gi,'&gt;');
}

/* jQuery timePicker - http://labs.perifer.se/timedatepicker/ @ http://github.com/perifer/timePicker commit 100644 */
(function(e){function t(t,n,r,i){t.value=e(n).text();e(t).change();if(!navigator.userAgent.match(/msie/i)){t.focus()}r.hide()}function n(e,t){var n=e.getHours();var i=t.show24Hours?n:(n+11)%12+1;var s=e.getMinutes();return r(i)+t.separator+r(s)+(t.show24Hours?"":n<12?" AM":" PM")}function r(e){return(e<10?"0":"")+e}function i(e,t){return typeof e=="object"?o(e):s(e,t)}function s(e,t){if(e){var n=e.split(t.separator);var r=parseFloat(n[0]);var i=parseFloat(n[1]);if(!t.show24Hours){if(r===12&&e.indexOf("AM")!==-1){r=0}else if(r!==12&&e.indexOf("PM")!==-1){r+=12}}var s=new Date(0,0,0,r,i,0);return o(s)}return null}function o(e){e.setFullYear(2001);e.setMonth(0);e.setDate(0);return e}e.fn.timePicker=function(t){var n=e.extend({},e.fn.timePicker.defaults,t);return this.each(function(){e.timePicker(this,n)})};e.timePicker=function(t,n){var r=e(t)[0];return r.timePicker||(r.timePicker=new jQuery._timePicker(r,n))};e.timePicker.version="0.3";e._timePicker=function(r,u){var a=false;var f=false;var l=i(u.startTime,u);var c=i(u.endTime,u);var h="selected";var p="li."+h;e(r).attr("autocomplete","OFF");var d=[];var v=new Date(l);while(v<=c){d[d.length]=n(v,u);v=new Date(v.setMinutes(v.getMinutes()+u.step))}var m=e('<div class="time-picker'+(u.show24Hours?"":" time-picker-12hours")+'"></div>');var g=e("<ul></ul>");for(var y=0;y<d.length;y++){g.append("<li>"+d[y]+"</li>")}m.append(g);m.appendTo("body").hide();m.mouseover(function(){a=true}).mouseout(function(){a=false});e("li",g).mouseover(function(){if(!f){e(p,m).removeClass(h);e(this).addClass(h)}}).mousedown(function(){a=true}).click(function(){t(r,this,m,u);a=false});var b=function(){if(m.is(":visible")){return false}e("li",m).removeClass(h);var t=e(r).offset();m.css({top:t.top+r.offsetHeight,left:t.left});m.show();var i=r.value?s(r.value,u):l;var a=l.getHours()*60+l.getMinutes();var f=i.getHours()*60+i.getMinutes()-a;var p=Math.round(f/u.step);var d=o(new Date(0,0,0,0,p*u.step+a,0));d=l<d&&d<=c?d:l;var v=e("li:contains("+n(d,u)+")",m);if(v.length){v.addClass(h);m[0].scrollTop=v[0].offsetTop}return true};e(r).focus(b).click(b);e(r).blur(function(){if(!a){m.hide()}});e(r)["keydown"](function(n){var i;f=true;var s=m[0].scrollTop;switch(n.keyCode){case 38:if(b()){return false}i=e(p,g);var o=i.prev().addClass(h)[0];if(o){i.removeClass(h);if(o.offsetTop<s){m[0].scrollTop=s-o.offsetHeight}}else{i.removeClass(h);o=e("li:last",g).addClass(h)[0];m[0].scrollTop=o.offsetTop-o.offsetHeight}return false;break;case 40:if(b()){return false}i=e(p,g);var a=i.next().addClass(h)[0];if(a){i.removeClass(h);if(a.offsetTop+a.offsetHeight>s+m[0].offsetHeight){m[0].scrollTop=s+a.offsetHeight}}else{i.removeClass(h);a=e("li:first",g).addClass(h)[0];m[0].scrollTop=0}return false;break;case 13:if(m.is(":visible")){var l=e(p,g)[0];t(r,l,m,u)}return false;break;case 27:m.hide();return false;break}return true});e(r).keyup(function(e){f=false});this.getTime=function(){return s(r.value,u)};this.setTime=function(t){r.value=n(i(t,u),u);e(r).change()}};e.fn.timePicker.defaults={step:30,startTime:new Date(0,0,0,0,0,0),endTime:new Date(0,0,0,23,30,0),separator:":",show24Hours:true}})(jQuery);
// source --> https://www.wealllove.com/wp-content/plugins/srizon-facebook-album-pro/resources/js/modernizr.js?ver=4.9.5 
/* Modernizr 2.6.2 (Custom Build) | MIT & BSD
 * Build: http://modernizr.com/download/#-csstransforms-csstransitions-touch-shiv-cssclasses-prefixed-teststyles-testprop-testallprops-prefixes-domprefixes-load
 */
;window.Modernizr=function(a,b,c){function z(a){j.cssText=a}function A(a,b){return z(m.join(a+";")+(b||""))}function B(a,b){return typeof a===b}function C(a,b){return!!~(""+a).indexOf(b)}function D(a,b){for(var d in a){var e=a[d];if(!C(e,"-")&&j[e]!==c)return b=="pfx"?e:!0}return!1}function E(a,b,d){for(var e in a){var f=b[a[e]];if(f!==c)return d===!1?a[e]:B(f,"function")?f.bind(d||b):f}return!1}function F(a,b,c){var d=a.charAt(0).toUpperCase()+a.slice(1),e=(a+" "+o.join(d+" ")+d).split(" ");return B(b,"string")||B(b,"undefined")?D(e,b):(e=(a+" "+p.join(d+" ")+d).split(" "),E(e,b,c))}var d="2.6.2",e={},f=!0,g=b.documentElement,h="modernizr",i=b.createElement(h),j=i.style,k,l={}.toString,m=" -webkit- -moz- -o- -ms- ".split(" "),n="Webkit Moz O ms",o=n.split(" "),p=n.toLowerCase().split(" "),q={},r={},s={},t=[],u=t.slice,v,w=function(a,c,d,e){var f,i,j,k,l=b.createElement("div"),m=b.body,n=m||b.createElement("body");if(parseInt(d,10))while(d--)j=b.createElement("div"),j.id=e?e[d]:h+(d+1),l.appendChild(j);return f=["&#173;",'<style id="s',h,'">',a,"</style>"].join(""),l.id=h,(m?l:n).innerHTML+=f,n.appendChild(l),m||(n.style.background="",n.style.overflow="hidden",k=g.style.overflow,g.style.overflow="hidden",g.appendChild(n)),i=c(l,a),m?l.parentNode.removeChild(l):(n.parentNode.removeChild(n),g.style.overflow=k),!!i},x={}.hasOwnProperty,y;!B(x,"undefined")&&!B(x.call,"undefined")?y=function(a,b){return x.call(a,b)}:y=function(a,b){return b in a&&B(a.constructor.prototype[b],"undefined")},Function.prototype.bind||(Function.prototype.bind=function(b){var c=this;if(typeof c!="function")throw new TypeError;var d=u.call(arguments,1),e=function(){if(this instanceof e){var a=function(){};a.prototype=c.prototype;var f=new a,g=c.apply(f,d.concat(u.call(arguments)));return Object(g)===g?g:f}return c.apply(b,d.concat(u.call(arguments)))};return e}),q.touch=function(){var c;return"ontouchstart"in a||a.DocumentTouch&&b instanceof DocumentTouch?c=!0:w(["@media (",m.join("touch-enabled),("),h,")","{#modernizr{top:9px;position:absolute}}"].join(""),function(a){c=a.offsetTop===9}),c},q.csstransforms=function(){return!!F("transform")},q.csstransitions=function(){return F("transition")};for(var G in q)y(q,G)&&(v=G.toLowerCase(),e[v]=q[G](),t.push((e[v]?"":"no-")+v));return e.addTest=function(a,b){if(typeof a=="object")for(var d in a)y(a,d)&&e.addTest(d,a[d]);else{a=a.toLowerCase();if(e[a]!==c)return e;b=typeof b=="function"?b():b,typeof f!="undefined"&&f&&(g.className+=" "+(b?"":"no-")+a),e[a]=b}return e},z(""),i=k=null,function(a,b){function k(a,b){var c=a.createElement("p"),d=a.getElementsByTagName("head")[0]||a.documentElement;return c.innerHTML="x<style>"+b+"</style>",d.insertBefore(c.lastChild,d.firstChild)}function l(){var a=r.elements;return typeof a=="string"?a.split(" "):a}function m(a){var b=i[a[g]];return b||(b={},h++,a[g]=h,i[h]=b),b}function n(a,c,f){c||(c=b);if(j)return c.createElement(a);f||(f=m(c));var g;return f.cache[a]?g=f.cache[a].cloneNode():e.test(a)?g=(f.cache[a]=f.createElem(a)).cloneNode():g=f.createElem(a),g.canHaveChildren&&!d.test(a)?f.frag.appendChild(g):g}function o(a,c){a||(a=b);if(j)return a.createDocumentFragment();c=c||m(a);var d=c.frag.cloneNode(),e=0,f=l(),g=f.length;for(;e<g;e++)d.createElement(f[e]);return d}function p(a,b){b.cache||(b.cache={},b.createElem=a.createElement,b.createFrag=a.createDocumentFragment,b.frag=b.createFrag()),a.createElement=function(c){return r.shivMethods?n(c,a,b):b.createElem(c)},a.createDocumentFragment=Function("h,f","return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&("+l().join().replace(/\w+/g,function(a){return b.createElem(a),b.frag.createElement(a),'c("'+a+'")'})+");return n}")(r,b.frag)}function q(a){a||(a=b);var c=m(a);return r.shivCSS&&!f&&!c.hasCSS&&(c.hasCSS=!!k(a,"article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")),j||p(a,c),a}var c=a.html5||{},d=/^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,e=/^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,f,g="_html5shiv",h=0,i={},j;(function(){try{var a=b.createElement("a");a.innerHTML="<xyz></xyz>",f="hidden"in a,j=a.childNodes.length==1||function(){b.createElement("a");var a=b.createDocumentFragment();return typeof a.cloneNode=="undefined"||typeof a.createDocumentFragment=="undefined"||typeof a.createElement=="undefined"}()}catch(c){f=!0,j=!0}})();var r={elements:c.elements||"abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",shivCSS:c.shivCSS!==!1,supportsUnknownElements:j,shivMethods:c.shivMethods!==!1,type:"default",shivDocument:q,createElement:n,createDocumentFragment:o};a.html5=r,q(b)}(this,b),e._version=d,e._prefixes=m,e._domPrefixes=p,e._cssomPrefixes=o,e.testProp=function(a){return D([a])},e.testAllProps=F,e.testStyles=w,e.prefixed=function(a,b,c){return b?F(a,b,c):F(a,"pfx")},g.className=g.className.replace(/(^|\s)no-js(\s|$)/,"$1$2")+(f?" js "+t.join(" "):""),e}(this,this.document),function(a,b,c){function d(a){return"[object Function]"==o.call(a)}function e(a){return"string"==typeof a}function f(){}function g(a){return!a||"loaded"==a||"complete"==a||"uninitialized"==a}function h(){var a=p.shift();q=1,a?a.t?m(function(){("c"==a.t?B.injectCss:B.injectJs)(a.s,0,a.a,a.x,a.e,1)},0):(a(),h()):q=0}function i(a,c,d,e,f,i,j){function k(b){if(!o&&g(l.readyState)&&(u.r=o=1,!q&&h(),l.onload=l.onreadystatechange=null,b)){"img"!=a&&m(function(){t.removeChild(l)},50);for(var d in y[c])y[c].hasOwnProperty(d)&&y[c][d].onload()}}var j=j||B.errorTimeout,l=b.createElement(a),o=0,r=0,u={t:d,s:c,e:f,a:i,x:j};1===y[c]&&(r=1,y[c]=[]),"object"==a?l.data=c:(l.src=c,l.type=a),l.width=l.height="0",l.onerror=l.onload=l.onreadystatechange=function(){k.call(this,r)},p.splice(e,0,u),"img"!=a&&(r||2===y[c]?(t.insertBefore(l,s?null:n),m(k,j)):y[c].push(l))}function j(a,b,c,d,f){return q=0,b=b||"j",e(a)?i("c"==b?v:u,a,b,this.i++,c,d,f):(p.splice(this.i++,0,a),1==p.length&&h()),this}function k(){var a=B;return a.loader={load:j,i:0},a}var l=b.documentElement,m=a.setTimeout,n=b.getElementsByTagName("script")[0],o={}.toString,p=[],q=0,r="MozAppearance"in l.style,s=r&&!!b.createRange().compareNode,t=s?l:n.parentNode,l=a.opera&&"[object Opera]"==o.call(a.opera),l=!!b.attachEvent&&!l,u=r?"object":l?"script":"img",v=l?"script":u,w=Array.isArray||function(a){return"[object Array]"==o.call(a)},x=[],y={},z={timeout:function(a,b){return b.length&&(a.timeout=b[0]),a}},A,B;B=function(a){function b(a){var a=a.split("!"),b=x.length,c=a.pop(),d=a.length,c={url:c,origUrl:c,prefixes:a},e,f,g;for(f=0;f<d;f++)g=a[f].split("="),(e=z[g.shift()])&&(c=e(c,g));for(f=0;f<b;f++)c=x[f](c);return c}function g(a,e,f,g,h){var i=b(a),j=i.autoCallback;i.url.split(".").pop().split("?").shift(),i.bypass||(e&&(e=d(e)?e:e[a]||e[g]||e[a.split("/").pop().split("?")[0]]),i.instead?i.instead(a,e,f,g,h):(y[i.url]?i.noexec=!0:y[i.url]=1,f.load(i.url,i.forceCSS||!i.forceJS&&"css"==i.url.split(".").pop().split("?").shift()?"c":c,i.noexec,i.attrs,i.timeout),(d(e)||d(j))&&f.load(function(){k(),e&&e(i.origUrl,h,g),j&&j(i.origUrl,h,g),y[i.url]=2})))}function h(a,b){function c(a,c){if(a){if(e(a))c||(j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}),g(a,j,b,0,h);else if(Object(a)===a)for(n in m=function(){var b=0,c;for(c in a)a.hasOwnProperty(c)&&b++;return b}(),a)a.hasOwnProperty(n)&&(!c&&!--m&&(d(j)?j=function(){var a=[].slice.call(arguments);k.apply(this,a),l()}:j[n]=function(a){return function(){var b=[].slice.call(arguments);a&&a.apply(this,b),l()}}(k[n])),g(a[n],j,b,n,h))}else!c&&l()}var h=!!a.test,i=a.load||a.both,j=a.callback||f,k=j,l=a.complete||f,m,n;c(h?a.yep:a.nope,!!i),i&&c(i)}var i,j,l=this.yepnope.loader;if(e(a))g(a,0,l,0);else if(w(a))for(i=0;i<a.length;i++)j=a[i],e(j)?g(j,0,l,0):w(j)?B(j):Object(j)===j&&h(j,l);else Object(a)===a&&h(a,l)},B.addPrefix=function(a,b){z[a]=b},B.addFilter=function(a){x.push(a)},B.errorTimeout=1e4,null==b.readyState&&b.addEventListener&&(b.readyState="loading",b.addEventListener("DOMContentLoaded",A=function(){b.removeEventListener("DOMContentLoaded",A,0),b.readyState="complete"},0)),a.yepnope=k(),a.yepnope.executeStack=h,a.yepnope.injectJs=function(a,c,d,e,i,j){var k=b.createElement("script"),l,o,e=e||B.errorTimeout;k.src=a;for(o in d)k.setAttribute(o,d[o]);c=j?h:c||f,k.onreadystatechange=k.onload=function(){!l&&g(k.readyState)&&(l=1,c(),k.onload=k.onreadystatechange=null)},m(function(){l||(l=1,c(1))},e),i?k.onload():n.parentNode.insertBefore(k,n)},a.yepnope.injectCss=function(a,c,d,e,g,i){var e=b.createElement("link"),j,c=i?h:c||f;e.href=a,e.rel="stylesheet",e.type="text/css";for(j in d)e.setAttribute(j,d[j]);g||(n.parentNode.insertBefore(e,n),m(c,0))}}(this,document),Modernizr.load=function(){yepnope.apply(window,[].slice.call(arguments,0))};
// source --> https://www.wealllove.com/wp-content/plugins/srizon-facebook-album-pro/resources/js/mag-popup.js?ver=4.9.5 
/*! Magnific Popup - v0.9.9 - 2013-12-27
* http://dimsemenov.com/plugins/magnific-popup/
* Copyright (c) 2013 Dmitry Semenov; */
;(function(e){var t,n,i,o,r,a,s,l="Close",c="BeforeClose",d="AfterClose",u="BeforeAppend",p="MarkupParse",f="Open",m="Change",g="mfp",h="."+g,v="mfp-ready",C="mfp-removing",y="mfp-prevent-close",w=function(){},b=!!window.jQuery,I=e(window),x=function(e,n){t.ev.on(g+e+h,n)},k=function(t,n,i,o){var r=document.createElement("div");return r.className="mfp-"+t,i&&(r.innerHTML=i),o?n&&n.appendChild(r):(r=e(r),n&&r.appendTo(n)),r},T=function(n,i){t.ev.triggerHandler(g+n,i),t.st.callbacks&&(n=n.charAt(0).toLowerCase()+n.slice(1),t.st.callbacks[n]&&t.st.callbacks[n].apply(t,e.isArray(i)?i:[i]))},E=function(n){return n===s&&t.currTemplate.closeBtn||(t.currTemplate.closeBtn=e(t.st.closeMarkup.replace("%title%",t.st.tClose)),s=n),t.currTemplate.closeBtn},_=function(){e.magnificPopup.instance||(t=new w,t.init(),e.magnificPopup.instance=t)},S=function(){var e=document.createElement("p").style,t=["ms","O","Moz","Webkit"];if(void 0!==e.transition)return!0;for(;t.length;)if(t.pop()+"Transition"in e)return!0;return!1};w.prototype={constructor:w,init:function(){var n=navigator.appVersion;t.isIE7=-1!==n.indexOf("MSIE 7."),t.isIE8=-1!==n.indexOf("MSIE 8."),t.isLowIE=t.isIE7||t.isIE8,t.isAndroid=/android/gi.test(n),t.isIOS=/iphone|ipad|ipod/gi.test(n),t.supportsTransition=S(),t.probablyMobile=t.isAndroid||t.isIOS||/(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent),o=e(document),t.popupsCache={}},open:function(n){i||(i=e(document.body));var r;if(n.isObj===!1){t.items=n.items.toArray(),t.index=0;var s,l=n.items;for(r=0;l.length>r;r++)if(s=l[r],s.parsed&&(s=s.el[0]),s===n.el[0]){t.index=r;break}}else t.items=e.isArray(n.items)?n.items:[n.items],t.index=n.index||0;if(t.isOpen)return t.updateItemHTML(),void 0;t.types=[],a="",t.ev=n.mainEl&&n.mainEl.length?n.mainEl.eq(0):o,n.key?(t.popupsCache[n.key]||(t.popupsCache[n.key]={}),t.currTemplate=t.popupsCache[n.key]):t.currTemplate={},t.st=e.extend(!0,{},e.magnificPopup.defaults,n),t.fixedContentPos="auto"===t.st.fixedContentPos?!t.probablyMobile:t.st.fixedContentPos,t.st.modal&&(t.st.closeOnContentClick=!1,t.st.closeOnBgClick=!1,t.st.showCloseBtn=!1,t.st.enableEscapeKey=!1),t.bgOverlay||(t.bgOverlay=k("bg").on("click"+h,function(){t.close()}),t.wrap=k("wrap").attr("tabindex",-1).on("click"+h,function(e){t._checkIfClose(e.target)&&t.close()}),t.container=k("container",t.wrap)),t.contentContainer=k("content"),t.st.preloader&&(t.preloader=k("preloader",t.container,t.st.tLoading));var c=e.magnificPopup.modules;for(r=0;c.length>r;r++){var d=c[r];d=d.charAt(0).toUpperCase()+d.slice(1),t["init"+d].call(t)}T("BeforeOpen"),t.st.showCloseBtn&&(t.st.closeBtnInside?(x(p,function(e,t,n,i){n.close_replaceWith=E(i.type)}),a+=" mfp-close-btn-in"):t.wrap.append(E())),t.st.alignTop&&(a+=" mfp-align-top"),t.fixedContentPos?t.wrap.css({overflow:t.st.overflowY,overflowX:"hidden",overflowY:t.st.overflowY}):t.wrap.css({top:I.scrollTop(),position:"absolute"}),(t.st.fixedBgPos===!1||"auto"===t.st.fixedBgPos&&!t.fixedContentPos)&&t.bgOverlay.css({height:o.height(),position:"absolute"}),t.st.enableEscapeKey&&o.on("keyup"+h,function(e){27===e.keyCode&&t.close()}),I.on("resize"+h,function(){t.updateSize()}),t.st.closeOnContentClick||(a+=" mfp-auto-cursor"),a&&t.wrap.addClass(a);var u=t.wH=I.height(),m={};if(t.fixedContentPos&&t._hasScrollBar(u)){var g=t._getScrollbarSize();g&&(m.marginRight=g)}t.fixedContentPos&&(t.isIE7?e("body, html").css("overflow","hidden"):m.overflow="hidden");var C=t.st.mainClass;return t.isIE7&&(C+=" mfp-ie7"),C&&t._addClassToMFP(C),t.updateItemHTML(),T("BuildControls"),e("html").css(m),t.bgOverlay.add(t.wrap).prependTo(t.st.prependTo||i),t._lastFocusedEl=document.activeElement,setTimeout(function(){t.content?(t._addClassToMFP(v),t._setFocus()):t.bgOverlay.addClass(v),o.on("focusin"+h,t._onFocusIn)},16),t.isOpen=!0,t.updateSize(u),T(f),n},close:function(){t.isOpen&&(T(c),t.isOpen=!1,t.st.removalDelay&&!t.isLowIE&&t.supportsTransition?(t._addClassToMFP(C),setTimeout(function(){t._close()},t.st.removalDelay)):t._close())},_close:function(){T(l);var n=C+" "+v+" ";if(t.bgOverlay.detach(),t.wrap.detach(),t.container.empty(),t.st.mainClass&&(n+=t.st.mainClass+" "),t._removeClassFromMFP(n),t.fixedContentPos){var i={marginRight:""};t.isIE7?e("body, html").css("overflow",""):i.overflow="",e("html").css(i)}o.off("keyup"+h+" focusin"+h),t.ev.off(h),t.wrap.attr("class","mfp-wrap").removeAttr("style"),t.bgOverlay.attr("class","mfp-bg"),t.container.attr("class","mfp-container"),!t.st.showCloseBtn||t.st.closeBtnInside&&t.currTemplate[t.currItem.type]!==!0||t.currTemplate.closeBtn&&t.currTemplate.closeBtn.detach(),t._lastFocusedEl&&e(t._lastFocusedEl).focus(),t.currItem=null,t.content=null,t.currTemplate=null,t.prevHeight=0,T(d)},updateSize:function(e){if(t.isIOS){var n=document.documentElement.clientWidth/window.innerWidth,i=window.innerHeight*n;t.wrap.css("height",i),t.wH=i}else t.wH=e||I.height();t.fixedContentPos||t.wrap.css("height",t.wH),T("Resize")},updateItemHTML:function(){var n=t.items[t.index];t.contentContainer.detach(),t.content&&t.content.detach(),n.parsed||(n=t.parseEl(t.index));var i=n.type;if(T("BeforeChange",[t.currItem?t.currItem.type:"",i]),t.currItem=n,!t.currTemplate[i]){var o=t.st[i]?t.st[i].markup:!1;T("FirstMarkupParse",o),t.currTemplate[i]=o?e(o):!0}r&&r!==n.type&&t.container.removeClass("mfp-"+r+"-holder");var a=t["get"+i.charAt(0).toUpperCase()+i.slice(1)](n,t.currTemplate[i]);t.appendContent(a,i),n.preloaded=!0,T(m,n),r=n.type,t.container.prepend(t.contentContainer),T("AfterChange")},appendContent:function(e,n){t.content=e,e?t.st.showCloseBtn&&t.st.closeBtnInside&&t.currTemplate[n]===!0?t.content.find(".mfp-close").length||t.content.append(E()):t.content=e:t.content="",T(u),t.container.addClass("mfp-"+n+"-holder"),t.contentContainer.append(t.content)},parseEl:function(n){var i,o=t.items[n];if(o.tagName?o={el:e(o)}:(i=o.type,o={data:o,src:o.src}),o.el){for(var r=t.types,a=0;r.length>a;a++)if(o.el.hasClass("mfp-"+r[a])){i=r[a];break}o.src=o.el.attr("data-mfp-src"),o.src||(o.src=o.el.attr("href"))}return o.type=i||t.st.type||"inline",o.index=n,o.parsed=!0,t.items[n]=o,T("ElementParse",o),t.items[n]},addGroup:function(e,n){var i=function(i){i.mfpEl=this,t._openClick(i,e,n)};n||(n={});var o="click.magnificPopup";n.mainEl=e,n.items?(n.isObj=!0,e.off(o).on(o,i)):(n.isObj=!1,n.delegate?e.off(o).on(o,n.delegate,i):(n.items=e,e.off(o).on(o,i)))},_openClick:function(n,i,o){var r=void 0!==o.midClick?o.midClick:e.magnificPopup.defaults.midClick;if(r||2!==n.which&&!n.ctrlKey&&!n.metaKey){var a=void 0!==o.disableOn?o.disableOn:e.magnificPopup.defaults.disableOn;if(a)if(e.isFunction(a)){if(!a.call(t))return!0}else if(a>I.width())return!0;n.type&&(n.preventDefault(),t.isOpen&&n.stopPropagation()),o.el=e(n.mfpEl),o.delegate&&(o.items=i.find(o.delegate)),t.open(o)}},updateStatus:function(e,i){if(t.preloader){n!==e&&t.container.removeClass("mfp-s-"+n),i||"loading"!==e||(i=t.st.tLoading);var o={status:e,text:i};T("UpdateStatus",o),e=o.status,i=o.text,t.preloader.html(i),t.preloader.find("a").on("click",function(e){e.stopImmediatePropagation()}),t.container.addClass("mfp-s-"+e),n=e}},_checkIfClose:function(n){if(!e(n).hasClass(y)){var i=t.st.closeOnContentClick,o=t.st.closeOnBgClick;if(i&&o)return!0;if(!t.content||e(n).hasClass("mfp-close")||t.preloader&&n===t.preloader[0])return!0;if(n===t.content[0]||e.contains(t.content[0],n)){if(i)return!0}else if(o&&e.contains(document,n))return!0;return!1}},_addClassToMFP:function(e){t.bgOverlay.addClass(e),t.wrap.addClass(e)},_removeClassFromMFP:function(e){this.bgOverlay.removeClass(e),t.wrap.removeClass(e)},_hasScrollBar:function(e){return(t.isIE7?o.height():document.body.scrollHeight)>(e||I.height())},_setFocus:function(){(t.st.focus?t.content.find(t.st.focus).eq(0):t.wrap).focus()},_onFocusIn:function(n){return n.target===t.wrap[0]||e.contains(t.wrap[0],n.target)?void 0:(t._setFocus(),!1)},_parseMarkup:function(t,n,i){var o;i.data&&(n=e.extend(i.data,n)),T(p,[t,n,i]),e.each(n,function(e,n){if(void 0===n||n===!1)return!0;if(o=e.split("_"),o.length>1){var i=t.find(h+"-"+o[0]);if(i.length>0){var r=o[1];"replaceWith"===r?i[0]!==n[0]&&i.replaceWith(n):"img"===r?i.is("img")?i.attr("src",n):i.replaceWith('<img src="'+n+'" class="'+i.attr("class")+'" />'):i.attr(o[1],n)}}else t.find(h+"-"+e).html(n)})},_getScrollbarSize:function(){if(void 0===t.scrollbarSize){var e=document.createElement("div");e.id="mfp-sbm",e.style.cssText="width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;",document.body.appendChild(e),t.scrollbarSize=e.offsetWidth-e.clientWidth,document.body.removeChild(e)}return t.scrollbarSize}},e.magnificPopup={instance:null,proto:w.prototype,modules:[],open:function(t,n){return _(),t=t?e.extend(!0,{},t):{},t.isObj=!0,t.index=n||0,this.instance.open(t)},close:function(){return e.magnificPopup.instance&&e.magnificPopup.instance.close()},registerModule:function(t,n){n.options&&(e.magnificPopup.defaults[t]=n.options),e.extend(this.proto,n.proto),this.modules.push(t)},defaults:{disableOn:0,key:null,midClick:!1,mainClass:"",preloader:!0,focus:"",closeOnContentClick:!1,closeOnBgClick:!0,closeBtnInside:!0,showCloseBtn:!0,enableEscapeKey:!0,modal:!1,alignTop:!1,removalDelay:0,prependTo:null,fixedContentPos:"auto",fixedBgPos:"auto",overflowY:"auto",closeMarkup:'<button title="%title%" type="button" class="mfp-close">&times;</button>',tClose:"Close (Esc)",tLoading:"Loading..."}},e.fn.magnificPopup=function(n){_();var i=e(this);if("string"==typeof n)if("open"===n){var o,r=b?i.data("magnificPopup"):i[0].magnificPopup,a=parseInt(arguments[1],10)||0;r.items?o=r.items[a]:(o=i,r.delegate&&(o=o.find(r.delegate)),o=o.eq(a)),t._openClick({mfpEl:o},i,r)}else t.isOpen&&t[n].apply(t,Array.prototype.slice.call(arguments,1));else n=e.extend(!0,{},n),b?i.data("magnificPopup",n):i[0].magnificPopup=n,t.addGroup(i,n);return i};var P,O,z,M="inline",B=function(){z&&(O.after(z.addClass(P)).detach(),z=null)};e.magnificPopup.registerModule(M,{options:{hiddenClass:"hide",markup:"",tNotFound:"Content not found"},proto:{initInline:function(){t.types.push(M),x(l+"."+M,function(){B()})},getInline:function(n,i){if(B(),n.src){var o=t.st.inline,r=e(n.src);if(r.length){var a=r[0].parentNode;a&&a.tagName&&(O||(P=o.hiddenClass,O=k(P),P="mfp-"+P),z=r.after(O).detach().removeClass(P)),t.updateStatus("ready")}else t.updateStatus("error",o.tNotFound),r=e("<div>");return n.inlineElement=r,r}return t.updateStatus("ready"),t._parseMarkup(i,{},n),i}}});var F,H="ajax",L=function(){F&&i.removeClass(F)},A=function(){L(),t.req&&t.req.abort()};e.magnificPopup.registerModule(H,{options:{settings:null,cursor:"mfp-ajax-cur",tError:'<a href="%url%">The content</a> could not be loaded.'},proto:{initAjax:function(){t.types.push(H),F=t.st.ajax.cursor,x(l+"."+H,A),x("BeforeChange."+H,A)},getAjax:function(n){F&&i.addClass(F),t.updateStatus("loading");var o=e.extend({url:n.src,success:function(i,o,r){var a={data:i,xhr:r};T("ParseAjax",a),t.appendContent(e(a.data),H),n.finished=!0,L(),t._setFocus(),setTimeout(function(){t.wrap.addClass(v)},16),t.updateStatus("ready"),T("AjaxContentAdded")},error:function(){L(),n.finished=n.loadError=!0,t.updateStatus("error",t.st.ajax.tError.replace("%url%",n.src))}},t.st.ajax.settings);return t.req=e.ajax(o),""}}});var j,N=function(n){if(n.data&&void 0!==n.data.title)return n.data.title;var i=t.st.image.titleSrc;if(i){if(e.isFunction(i))return i.call(t,n);if(n.el)return n.el.attr(i)||""}return""};e.magnificPopup.registerModule("image",{options:{markup:'<div class="mfp-figure"><div class="mfp-close"></div><figure><div class="mfp-img"></div><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter"></div></div></figcaption></figure></div>',cursor:"mfp-zoom-out-cur",titleSrc:"title",verticalFit:!0,tError:'<a href="%url%">The image</a> could not be loaded.'},proto:{initImage:function(){var e=t.st.image,n=".image";t.types.push("image"),x(f+n,function(){"image"===t.currItem.type&&e.cursor&&i.addClass(e.cursor)}),x(l+n,function(){e.cursor&&i.removeClass(e.cursor),I.off("resize"+h)}),x("Resize"+n,t.resizeImage),t.isLowIE&&x("AfterChange",t.resizeImage)},resizeImage:function(){var e=t.currItem;if(e&&e.img&&t.st.image.verticalFit){var n=0;t.isLowIE&&(n=parseInt(e.img.css("padding-top"),10)+parseInt(e.img.css("padding-bottom"),10)),e.img.css("max-height",t.wH-n)}},_onImageHasSize:function(e){e.img&&(e.hasSize=!0,j&&clearInterval(j),e.isCheckingImgSize=!1,T("ImageHasSize",e),e.imgHidden&&(t.content&&t.content.removeClass("mfp-loading"),e.imgHidden=!1))},findImageSize:function(e){var n=0,i=e.img[0],o=function(r){j&&clearInterval(j),j=setInterval(function(){return i.naturalWidth>0?(t._onImageHasSize(e),void 0):(n>200&&clearInterval(j),n++,3===n?o(10):40===n?o(50):100===n&&o(500),void 0)},r)};o(1)},getImage:function(n,i){var o=0,r=function(){n&&(n.img[0].complete?(n.img.off(".mfploader"),n===t.currItem&&(t._onImageHasSize(n),t.updateStatus("ready")),n.hasSize=!0,n.loaded=!0,T("ImageLoadComplete")):(o++,200>o?setTimeout(r,100):a()))},a=function(){n&&(n.img.off(".mfploader"),n===t.currItem&&(t._onImageHasSize(n),t.updateStatus("error",s.tError.replace("%url%",n.src))),n.hasSize=!0,n.loaded=!0,n.loadError=!0)},s=t.st.image,l=i.find(".mfp-img");if(l.length){var c=document.createElement("img");c.className="mfp-img",n.img=e(c).on("load.mfploader",r).on("error.mfploader",a),c.src=n.src,l.is("img")&&(n.img=n.img.clone()),c=n.img[0],c.naturalWidth>0?n.hasSize=!0:c.width||(n.hasSize=!1)}return t._parseMarkup(i,{title:N(n),img_replaceWith:n.img},n),t.resizeImage(),n.hasSize?(j&&clearInterval(j),n.loadError?(i.addClass("mfp-loading"),t.updateStatus("error",s.tError.replace("%url%",n.src))):(i.removeClass("mfp-loading"),t.updateStatus("ready")),i):(t.updateStatus("loading"),n.loading=!0,n.hasSize||(n.imgHidden=!0,i.addClass("mfp-loading"),t.findImageSize(n)),i)}}});var W,R=function(){return void 0===W&&(W=void 0!==document.createElement("p").style.MozTransform),W};e.magnificPopup.registerModule("zoom",{options:{enabled:!1,easing:"ease-in-out",duration:300,opener:function(e){return e.is("img")?e:e.find("img")}},proto:{initZoom:function(){var e,n=t.st.zoom,i=".zoom";if(n.enabled&&t.supportsTransition){var o,r,a=n.duration,s=function(e){var t=e.clone().removeAttr("style").removeAttr("class").addClass("mfp-animated-image"),i="all "+n.duration/1e3+"s "+n.easing,o={position:"fixed",zIndex:9999,left:0,top:0,"-webkit-backface-visibility":"hidden"},r="transition";return o["-webkit-"+r]=o["-moz-"+r]=o["-o-"+r]=o[r]=i,t.css(o),t},d=function(){t.content.css("visibility","visible")};x("BuildControls"+i,function(){if(t._allowZoom()){if(clearTimeout(o),t.content.css("visibility","hidden"),e=t._getItemToZoom(),!e)return d(),void 0;r=s(e),r.css(t._getOffset()),t.wrap.append(r),o=setTimeout(function(){r.css(t._getOffset(!0)),o=setTimeout(function(){d(),setTimeout(function(){r.remove(),e=r=null,T("ZoomAnimationEnded")},16)},a)},16)}}),x(c+i,function(){if(t._allowZoom()){if(clearTimeout(o),t.st.removalDelay=a,!e){if(e=t._getItemToZoom(),!e)return;r=s(e)}r.css(t._getOffset(!0)),t.wrap.append(r),t.content.css("visibility","hidden"),setTimeout(function(){r.css(t._getOffset())},16)}}),x(l+i,function(){t._allowZoom()&&(d(),r&&r.remove(),e=null)})}},_allowZoom:function(){return"image"===t.currItem.type},_getItemToZoom:function(){return t.currItem.hasSize?t.currItem.img:!1},_getOffset:function(n){var i;i=n?t.currItem.img:t.st.zoom.opener(t.currItem.el||t.currItem);var o=i.offset(),r=parseInt(i.css("padding-top"),10),a=parseInt(i.css("padding-bottom"),10);o.top-=e(window).scrollTop()-r;var s={width:i.width(),height:(b?i.innerHeight():i[0].offsetHeight)-a-r};return R()?s["-moz-transform"]=s.transform="translate("+o.left+"px,"+o.top+"px)":(s.left=o.left,s.top=o.top),s}}});var Z="iframe",q="//about:blank",D=function(e){if(t.currTemplate[Z]){var n=t.currTemplate[Z].find("iframe");n.length&&(e||(n[0].src=q),t.isIE8&&n.css("display",e?"block":"none"))}};e.magnificPopup.registerModule(Z,{options:{markup:'<div class="mfp-iframe-scaler"><div class="mfp-close"></div><iframe class="mfp-iframe" src="//about:blank" frameborder="0" allowfullscreen></iframe></div>',srcAction:"iframe_src",patterns:{youtube:{index:"youtube.com",id:"v=",src:"//www.youtube.com/embed/%id%?autoplay=1&rel=0&iv_load_policy=3"},vimeo:{index:"vimeo.com/",id:"/",src:"//player.vimeo.com/video/%id%?autoplay=1"},gmaps:{index:"//maps.google.",src:"%id%&output=embed"}}},proto:{initIframe:function(){t.types.push(Z),x("BeforeChange",function(e,t,n){t!==n&&(t===Z?D():n===Z&&D(!0))}),x(l+"."+Z,function(){D()})},getIframe:function(n,i){var o=n.src,r=t.st.iframe;e.each(r.patterns,function(){return o.indexOf(this.index)>-1?(this.id&&(o="string"==typeof this.id?o.substr(o.lastIndexOf(this.id)+this.id.length,o.length):this.id.call(this,o)),o=this.src.replace("%id%",o),!1):void 0});var a={};return r.srcAction&&(a[r.srcAction]=o),t._parseMarkup(i,a,n),t.updateStatus("ready"),i}}});var K=function(e){var n=t.items.length;return e>n-1?e-n:0>e?n+e:e},Y=function(e,t,n){return e.replace(/%curr%/gi,t+1).replace(/%total%/gi,n)};e.magnificPopup.registerModule("gallery",{options:{enabled:!1,arrowMarkup:'<button title="%title%" type="button" class="mfpc-arrow mfpc-arrow-%dir%"></button>',preload:[0,2],navigateByImgClick:!0,arrows:!0,tPrev:"Previous (Left arrow key)",tNext:"Next (Right arrow key)",tCounter:"%curr% of %total%"},proto:{initGallery:function(){var n=t.st.gallery,i=".mfp-gallery",r=Boolean(e.fn.mfpFastClick);return t.direction=!0,n&&n.enabled?(a+=" mfp-gallery",x(f+i,function(){n.navigateByImgClick&&t.wrap.on("click"+i,".mfp-img",function(){return t.items.length>1?(t.next(),!1):void 0}),o.on("keydown"+i,function(e){37===e.keyCode?t.prev():39===e.keyCode&&t.next()})}),x("UpdateStatus"+i,function(e,n){n.text&&(n.text=Y(n.text,t.currItem.index,t.items.length))}),x(p+i,function(e,i,o,r){var a=t.items.length;o.counter=a>1?Y(n.tCounter,r.index,a):""}),x("BuildControls"+i,function(){if(t.items.length>1&&n.arrows&&!t.arrowLeft){var i=n.arrowMarkup,o=t.arrowLeft=e(i.replace(/%title%/gi,n.tPrev).replace(/%dir%/gi,"left")).addClass(y),a=t.arrowRight=e(i.replace(/%title%/gi,n.tNext).replace(/%dir%/gi,"right")).addClass(y),s=r?"mfpFastClick":"click";o[s](function(){t.prev()}),a[s](function(){t.next()}),t.isIE7&&(k("b",o[0],!1,!0),k("a",o[0],!1,!0),k("b",a[0],!1,!0),k("a",a[0],!1,!0)),t.container.append(o.add(a))}}),x(m+i,function(){t._preloadTimeout&&clearTimeout(t._preloadTimeout),t._preloadTimeout=setTimeout(function(){t.preloadNearbyImages(),t._preloadTimeout=null},16)}),x(l+i,function(){o.off(i),t.wrap.off("click"+i),t.arrowLeft&&r&&t.arrowLeft.add(t.arrowRight).destroyMfpFastClick(),t.arrowRight=t.arrowLeft=null}),void 0):!1},next:function(){t.direction=!0,t.index=K(t.index+1),t.updateItemHTML()},prev:function(){t.direction=!1,t.index=K(t.index-1),t.updateItemHTML()},goTo:function(e){t.direction=e>=t.index,t.index=e,t.updateItemHTML()},preloadNearbyImages:function(){var e,n=t.st.gallery.preload,i=Math.min(n[0],t.items.length),o=Math.min(n[1],t.items.length);for(e=1;(t.direction?o:i)>=e;e++)t._preloadItem(t.index+e);for(e=1;(t.direction?i:o)>=e;e++)t._preloadItem(t.index-e)},_preloadItem:function(n){if(n=K(n),!t.items[n].preloaded){var i=t.items[n];i.parsed||(i=t.parseEl(n)),T("LazyLoad",i),"image"===i.type&&(i.img=e('<img class="mfp-img" />').on("load.mfploader",function(){i.hasSize=!0}).on("error.mfploader",function(){i.hasSize=!0,i.loadError=!0,T("LazyLoadError",i)}).attr("src",i.src)),i.preloaded=!0}}}});var U="retina";e.magnificPopup.registerModule(U,{options:{replaceSrc:function(e){return e.src.replace(/\.\w+$/,function(e){return"@2x"+e})},ratio:1},proto:{initRetina:function(){if(window.devicePixelRatio>1){var e=t.st.retina,n=e.ratio;n=isNaN(n)?n():n,n>1&&(x("ImageHasSize."+U,function(e,t){t.img.css({"max-width":t.img[0].naturalWidth/n,width:"100%"})}),x("ElementParse."+U,function(t,i){i.src=e.replaceSrc(i,n)}))}}}}),function(){var t=1e3,n="ontouchstart"in window,i=function(){I.off("touchmove"+r+" touchend"+r)},o="mfpFastClick",r="."+o;e.fn.mfpFastClick=function(o){return e(this).each(function(){var a,s=e(this);if(n){var l,c,d,u,p,f;s.on("touchstart"+r,function(e){u=!1,f=1,p=e.originalEvent?e.originalEvent.touches[0]:e.touches[0],c=p.clientX,d=p.clientY,I.on("touchmove"+r,function(e){p=e.originalEvent?e.originalEvent.touches:e.touches,f=p.length,p=p[0],(Math.abs(p.clientX-c)>10||Math.abs(p.clientY-d)>10)&&(u=!0,i())}).on("touchend"+r,function(e){i(),u||f>1||(a=!0,e.preventDefault(),clearTimeout(l),l=setTimeout(function(){a=!1},t),o())})})}s.on("click"+r,function(){a||o()})})},e.fn.destroyMfpFastClick=function(){e(this).off("touchstart"+r+" click"+r),n&&I.off("touchmove"+r+" touchend"+r)}}(),_()})(window.jQuery||window.Zepto);

jQuery(document).ready(function() {
	if(jQuery('.magpopif').length){
		jQuery('.magpopif').magnificPopup({type:'iframe'});
	}
});
// source --> https://www.wealllove.com/wp-content/plugins/srizon-facebook-album-pro/resources/js/jquery.collagePlus.min.js?ver=4.9.5 
;!function(a){a.fn.collagePlus=function(b){function c(b,c,e,f){for(var g=e.padding*(b.length-1)+b.length*b[0][3],h=e.albumWidth-g,i=h/(c-g),j=g,k=c<e.albumWidth?!0:!1,l=0;l<b.length;l++){var m=a(b[l][0]),n=Math.floor(b[l][1]*i),o=Math.floor(b[l][2]*i),p=!!(l<b.length-1);e.allowPartialLastRow===!0&&k===!0&&(n=b[l][1],o=b[l][2]),j+=n,!p&&j<e.albumWidth&&(e.allowPartialLastRow===!0&&k===!0?n=n:n+=e.albumWidth-j),n--;var q=m.is("img")?m:m.find("img");q.width(n),m.is("img")||m.width(n+b[l][3]),q.height(o),m.is("img")||m.height(o+b[l][4]),d(m,p,e),q.one("loadc",function(a){return function(){if("default"==e.effect)a.animate({opacity:"1"},{duration:e.fadeSpeed});else{if("vertical"==e.direction)var b=10>=f?f:10;else var b=9>=l?l+1:10;a.removeClass(function(a,b){return(b.match(/\beffect-\S+/g)||[]).join(" ")}),a.addClass(e.effect),a.addClass("effect-duration-"+b)}}}(m)).each(function(){this.complete?a(this).trigger("loadc"):a(this).one("load",function(){a(this).trigger("loadc")})})}}function d(a,b,c){var d={"margin-bottom":c.padding+"px","margin-right":b?c.padding+"px":"0px",display:c.display,"vertical-align":"bottom",overflow:"hidden"};return a.css(d)}function e(b){$img=a(b);var c=new Array;return c.w=parseFloat($img.css("border-left-width"))+parseFloat($img.css("border-right-width")),c.h=parseFloat($img.css("border-top-width"))+parseFloat($img.css("border-bottom-width")),c}return this.each(function(){var d=0,f=[],g=1,h=a(this);a.fn.collagePlus.defaults.albumWidth=h.width(),a.fn.collagePlus.defaults.padding=parseFloat(h.css("padding-left")),a.fn.collagePlus.defaults.images=h.children();var i=a.extend({},a.fn.collagePlus.defaults,b);i.images.each(function(b){var h=a(this),j=h.is("img")?h:a(this).find("img"),k="undefined"!=typeof j.data("width")?j.data("width"):j.width(),l="undefined"!=typeof j.data("height")?j.data("height"):j.height(),m=e(j);j.data("width",k),j.data("height",l);var n=Math.ceil(k/l*i.targetHeight),o=Math.ceil(i.targetHeight);f.push([this,n,o,m.w,m.h]),d+=n+m.w+i.padding,d>i.albumWidth&&0!=f.length&&(c(f,d-i.padding,i,g),delete d,delete f,d=0,f=[],g+=1),i.images.length-1==b&&0!=f.length&&(c(f,d,i,g),delete d,delete f,d=0,f=[],g+=1)})})},a.fn.collagePlus.defaults={targetHeight:400,fadeSpeed:500,display:"inline-block",effect:"default",direction:"vertical",allowPartialLastRow:!1}}(jQuery);
// source --> https://www.wealllove.com/wp-content/plugins/srizon-facebook-album-pro/resources/js/jquery.elastislide.min.js?ver=4.9.5 
;!function(a,b,c){"use strict";var e,f,d=a.event;e=d.special.debouncedresize={setup:function(){a(this).on("resize",e.handler)},teardown:function(){a(this).off("resize",e.handler)},handler:function(a,b){var c=this,g=arguments,h=function(){a.type="debouncedresize",d.dispatch.apply(c,g)};f&&clearTimeout(f),b?h():f=setTimeout(h,e.threshold)},threshold:150};var g="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";a.fn.imagesLoaded=function(b){function l(){var c=a(j),f=a(k);e&&(k.length?e.reject(h,c,f):e.resolve(h)),a.isFunction(b)&&b.call(d,h,c,f)}function m(b,c){b.src!==g&&-1===a.inArray(b,i)&&(i.push(b),c?k.push(b):j.push(b),a.data(b,"imagesLoaded",{isBroken:c,src:b.src}),f&&e.notifyWith(a(b),[c,h,a(j),a(k)]),h.length===i.length&&(setTimeout(l),h.unbind(".imagesLoaded")))}var d=this,e=a.isFunction(a.Deferred)?a.Deferred():0,f=a.isFunction(e.notify),h=d.find("img").add(d.filter("img")),i=[],j=[],k=[];return a.isPlainObject(b)&&a.each(b,function(a,c){"callback"===a?b=c:e&&e[a](c)}),h.length?h.bind("load.imagesLoaded error.imagesLoaded",function(a){m(a.target,"error"===a.type)}).each(function(b,d){var e=d.src,f=a.data(d,"imagesLoaded");return f&&f.src===e?(m(d,f.isBroken),void 0):d.complete&&d.naturalWidth!==c?(m(d,0===d.naturalWidth||0===d.naturalHeight),void 0):((d.readyState||d.complete)&&(d.src=g,d.src=e),void 0)}):l(),e?e.promise(d):d};var h=a(b),i=b.Modernizr;a.Elastislide=function(b,c){this.$el=a(c),this._init(b)},a.Elastislide.defaults={orientation:"horizontal",speed:500,easing:"ease-in-out",minItems:1,start:0,onClick:function(){return!1},onReady:function(){return!1},onBeforeSlide:function(){return!1},onAfterSlide:function(){return!1}},a.Elastislide.prototype={_init:function(b){this.options=a.extend(!0,{},a.Elastislide.defaults,b);var c=this,d={WebkitTransition:"webkitTransitionEnd",MozTransition:"transitionend",OTransition:"oTransitionEnd",msTransition:"MSTransitionEnd",transition:"transitionend"};return this.transEndEventName=d[i.prefixed("transition")],this.support=i.csstransitions&&i.csstransforms,this.current=this.options.start,this.isSliding=!1,this.$items=this.$el.children("li"),this.itemsCount=this.$items.length,0===this.itemsCount?!1:(this._validate(),this.$items.detach(),this.$el.empty(),this.$el.append(this.$items),this.$el.wrap('<div class="elastislide-wrapper elastislide-loading elastislide-'+this.options.orientation+'"></div>'),this.hasTransition=!1,this.hasTransitionTimeout=setTimeout(function(){c._addTransition()},100),this.$el.imagesLoaded(function(){c.$el.show(),c._layout(),c._configure(),c.hasTransition?(c._removeTransition(),c._slideToItem(c.current),c.$el.on(c.transEndEventName,function(){c.$el.off(c.transEndEventName),c._setWrapperSize(),c._addTransition(),c._initEvents()})):(clearTimeout(c.hasTransitionTimeout),c._setWrapperSize(),c._initEvents(),c._slideToItem(c.current),setTimeout(function(){c._addTransition()},25)),c.options.onReady()}),void 0)},_validate:function(){this.options.speed<0&&(this.options.speed=500),(this.options.minItems<1||this.options.minItems>this.itemsCount)&&(this.options.minItems=1),(this.options.start<0||this.options.start>this.itemsCount-1)&&(this.options.start=0),"horizontal"!=this.options.orientation&&"vertical"!=this.options.orientation&&(this.options.orientation="horizontal")},_layout:function(){this.$el.wrap('<div class="elastislide-carousel"></div>'),this.$carousel=this.$el.parent(),this.$wrapper=this.$carousel.parent().removeClass("elastislide-loading");var a=this.$items.find("img:first");this.imgSize={width:a.outerWidth(!0),height:a.outerHeight(!0)},this._setItemsSize(),"horizontal"===this.options.orientation?this.$el.css("max-height",this.imgSize.height):this.$el.css("height",this.options.minItems*this.imgSize.height),this._addControls()},_addTransition:function(){this.support&&this.$el.css("transition","all "+this.options.speed+"ms "+this.options.easing),this.hasTransition=!0},_removeTransition:function(){this.support&&this.$el.css("transition","all 0s"),this.hasTransition=!1},_addControls:function(){var b=this;this.$navigation=a('<nav><span class="elastislide-prev">Previous</span><span class="elastislide-next">Next</span></nav>').appendTo(this.$wrapper),this.$navPrev=this.$navigation.find("span.elastislide-prev").on("mousedown.elastislide",function(){return b._slide("prev"),!1}),this.$navNext=this.$navigation.find("span.elastislide-next").on("mousedown.elastislide",function(){return b._slide("next"),!1})},_setItemsSize:function(){},_setWrapperSize:function(){"vertical"===this.options.orientation&&this.$wrapper.css({height:this.options.minItems*this.imgSize.height+parseInt(this.$wrapper.css("padding-top"))+parseInt(this.$wrapper.css("padding-bottom"))})},_configure:function(){this.fitCount="horizontal"===this.options.orientation?this.$carousel.width()<this.options.minItems*this.imgSize.width?this.options.minItems:Math.floor(this.$carousel.width()/this.imgSize.width):this.$carousel.height()<this.options.minItems*this.imgSize.height?this.options.minItems:Math.floor(this.$carousel.height()/this.imgSize.height)},_initEvents:function(){var b=this;h.on("debouncedresize.elastislide",function(){b._setItemsSize(),b._configure(),b._slideToItem(b.current)}),this.$el.on(this.transEndEventName,function(){b._onEndTransition()}),"horizontal"===this.options.orientation?this.$el.on({swipeleft:function(){b._slide("next")},swiperight:function(){b._slide("prev")}}):this.$el.on({swipeup:function(){b._slide("next")},swipedown:function(){b._slide("prev")}}),this.$el.on("click.elastislide","li",function(c){var d=a(this);b.options.onClick(d,d.index(),c)})},_destroy:function(a){this.$el.off(this.transEndEventName).off("swipeleft swiperight swipeup swipedown .elastislide"),h.off(".elastislide"),this.$el.css({"max-height":"none",transition:"none"}).unwrap(this.$carousel).unwrap(this.$wrapper),this.$items.css({width:"auto","max-width":"none","max-height":"none"}),this.$navigation.remove(),this.$wrapper.remove(),a&&a.call()},_toggleControls:function(a,b){b?"next"===a?this.$navNext.show():this.$navPrev.show():"next"===a?this.$navNext.hide():this.$navPrev.hide()},_slide:function(b,d){function e(b){var c=0;return a(b).find("li").each(function(){c+=a(this).width()}),c}if(this.isSliding)return!1;this.options.onBeforeSlide(),this.isSliding=!0;var f=e(this.$el),g=this,h=this.translation||0,i="horizontal"===this.options.orientation?this.$items.outerWidth(!0):this.$items.outerHeight(!0),j=f,k="horizontal"===this.options.orientation?this.$carousel.width():this.$carousel.height();if(d===c){var l=this.fitCount*i;if(0>l)return!1;if("next"===b&&j-(Math.abs(h)+l)<k)l=j-(Math.abs(h)+k),this._toggleControls("next",!1),this._toggleControls("prev",!0);else if("prev"===b&&Math.abs(h)-l<0)l=Math.abs(h),this._toggleControls("next",!0),this._toggleControls("prev",!1);else{var m="next"===b?Math.abs(h)+Math.abs(l):Math.abs(h)-Math.abs(l);m>0?this._toggleControls("prev",!0):this._toggleControls("prev",!1),j-k>m?this._toggleControls("next",!0):this._toggleControls("next",!1)}d="next"===b?h-l:h+l}else{var l=Math.abs(d);Math.max(j,k)-l<k&&(d=-(Math.max(j,k)-k)),l>0?this._toggleControls("prev",!0):this._toggleControls("prev",!1),Math.max(j,k)-k>l?this._toggleControls("next",!0):this._toggleControls("next",!1)}if(this.translation=d,h===d)return this._onEndTransition(),!1;if(this.support)"horizontal"===this.options.orientation?this.$el.css("transform","translateX("+d+"px)"):this.$el.css("transform","translateY("+d+"px)");else{a.fn.applyStyle=this.hasTransition?a.fn.animate:a.fn.css;var n="horizontal"===this.options.orientation?{left:d}:{top:d};this.$el.stop().applyStyle(n,a.extend(!0,[],{duration:this.options.speed,complete:function(){g._onEndTransition()}}))}this.hasTransition||this._onEndTransition()},_onEndTransition:function(){this.isSliding=!1,this.options.onAfterSlide()},_slideTo:function(a){var a=a||this.current,b=Math.abs(this.translation)||0,c="horizontal"===this.options.orientation?this.$items.outerWidth(!0):this.$items.outerHeight(!0),d=b+this.$carousel.width(),e=Math.abs(a*c);(e+c>d||b>e)&&this._slideToItem(a)},_slideToItem:function(a){var b="horizontal"===this.options.orientation?a*this.$items.outerWidth(!0):a*this.$items.outerHeight(!0);this._slide("",-b)},add:function(a){var b=this,c=this.current,d=this.$items.eq(this.current);this.$items=this.$el.children("li"),this.itemsCount=this.$items.length,this.current=d.index(),this._setItemsSize(),this._configure(),this._removeTransition(),c<this.current?this._slideToItem(this.current):this._slide("next",this.translation),setTimeout(function(){b._addTransition()},25),a&&a.call()},setCurrent:function(a,b){this.current=a,this._slideTo(),b&&b.call()},next:function(){self._slide("next")},previous:function(){self._slide("prev")},slideStart:function(){this._slideTo(0)},slideEnd:function(){this._slideTo(this.itemsCount-1)},destroy:function(a){this._destroy(a)}};var j=function(a){b.console&&b.console.error(a)};a.fn.elastislide=function(b){var c=a.data(this,"elastislide");if("string"==typeof b){var d=Array.prototype.slice.call(arguments,1);this.each(function(){return c?a.isFunction(c[b])&&"_"!==b.charAt(0)?(c[b].apply(c,d),void 0):(j("no such method '"+b+"' for elastislide self"),void 0):(j("cannot call methods on elastislide prior to initialization; attempted to call method '"+b+"'"),void 0)})}else this.each(function(){c?c._init():c=a.data(this,"elastislide",new a.Elastislide(b,this))});return c}}(jQuery,window);
// source --> https://www.wealllove.com/wp-content/plugins/srizon-facebook-album-pro/resources/js/srizon.custom.min.js?ver=2.3.2 
function load_juser_video(a,b){var c,d,e;e="autoplay=0",c="#vid"+a,d='<div><table class="juser-vid-table"><tr><td><div class="juser-vid-container"><iframe class="youtube-player" type="text/html" width="960" height="600" src="//www.youtube.com/embed/'+b+"?fs=1&rel=0&wmode=transparent"+e+'" frameborder="0" allowfullscreen></iframe></div></td></tr></table></div>',jQuery(c).html(d)}!function(a){a.fn.srzSingleImageSlider=function(b){function f(){var b=a("<img/>").attr("src",d.images_json[d.current_index].src).attr("alt",d.images_json[d.current_index].txt).css("height",d.fixed_height);a(c).fadeTo(d.fadeout_time,d.fade_opacity,function(){b.one("loadc",function(){a(c).html(b).fadeTo(d.fadein_time,1),1==d.hover_caption&&a(c).srzAltToCaption()}),b[0].complete?b.trigger("loadc"):b.one("load",function(){b.trigger("loadc")})})}var c=a(this).selector,d=a.extend({images_json:[],prev_class:".prev",next_class:".next",current_index:0,max_height:600,fadeout_time:300,fade_opacity:.3,fadein_time:300,fixed_height:"auto",hover_caption:1,thumb_container:""},b);a(this).css("max-height",d.max_height+"px");var e=a("<img/>").attr("src",d.images_json[d.current_index].src).attr("alt",d.images_json[d.current_index].txt).css("height",d.fixed_height);return a(this).html(e),1==d.hover_caption&&a(this).srzAltToCaption(),a(this).parent().find(d.next_class).each(function(){a(this).click(function(){d.current_index=(d.current_index+1)%d.images_json.length,f()})}),a(this).on("swipeleft",function(){d.current_index=(d.current_index+1)%d.images_json.length,f()}),a(this).on("swiperight",function(){d.current_index=(d.current_index+d.images_json.length-1)%d.images_json.length,f()}),a(this).parent().find(d.prev_class).each(function(){a(this).click(function(){d.current_index=(d.current_index+d.images_json.length-1)%d.images_json.length,f()})}),""!=d.thumb_container&&a(d.thumb_container).find("a").each(function(){a(this).click(function(){d.current_index=a(this).data("index"),f()})}),this}}(jQuery),function(a){a.fn.srzAltToCaption=function(){return this.find("img").each(function(){var b=a(this);a(this).on("loadc",function(){var c=a(this).attr("alt");if(""!=c){var d=a("<p>").addClass("current-caption").html(c);d.hide().insertAfter(a(this)),a(this).parent().hover(function(){var a=b.width()+"px",c=b.height()/2+"px",e=b.position().left+"px";d.css({position:"absolute",width:a,"max-height":c,bottom:"0",left:e}),d.fadeIn()},function(){d.fadeOut()})}}),a(this)[0].complete?a(this).trigger("loadc"):a(this).one("load",function(){a(this).trigger("loadc")})}),this}}(jQuery),function(a){a.fn.srzSingleImageCard=function(b){function h(){d.current_index=(d.current_index+1)%d.images_json.length;var b=(d.current_index+2)%d.images_json.length,e=a("<img/>").attr("src",d.images_json[b].src).attr("alt",d.images_json[b].txt).addClass("card-third").appendTo(a(c)).hide();i(c,d.animation_time-100);var f=a(".card-first").removeClass("card-first").addClass("card-to-be-removed"),g=f.next("img").removeClass("card-second").addClass("card-first").css("max-height","inherit"),j=g.next("img").removeClass("card-third").addClass("card-second");setTimeout(function(){f.remove()},d.animation_time+500),g.one("loadc",function(){if(a(this).attr("alt").length>0&&1==d.hover_caption){var b=a(this).parent().find(".current-caption").html(a(this).attr("alt"));a(this).hover(function(){var c=a(this).width()+"px",d=a(this).height()/2+"px",e=a(this).position().left+"px";b.css({position:"absolute",width:c,"max-height":d,bottom:"0",left:e}),b.fadeIn()},function(){b.fadeOut()})}j.css("max-height",d.max_height/6+"px"),e.css("max-height",d.max_height/12+"px").show(),setTimeout(function(){e.addClass("withtransition")},500),a(this).click(function(){h()})}),g[0].complete?g.trigger("loadc"):g.one("load",function(){g.trigger("loadc")})}function i(a,b){var c=jQuery(a);c.height(c.height()),setTimeout(function(){c.height("auto")},b)}var c=a(this).selector,d=a.extend({images_json:[],next_class:".next",current_index:0,max_height:600,animation_time:500,hover_caption:1,thumb_container:""},b);if(a(this).css("max-height",d.max_height+"px"),d.images_json.length<3)a(this).html("<h3>This layout requires at list 3 images</h3>");else{var e=a("<img/>").attr("src",d.images_json[d.current_index].src).attr("alt",d.images_json[d.current_index].txt).addClass("withtransition card-first").appendTo(this),f=a("<img/>").attr("src",d.images_json[d.current_index+1].src).attr("alt",d.images_json[d.current_index+1].txt).addClass("withtransition card-second").appendTo(this).hide(),g=a("<img/>").attr("src",d.images_json[d.current_index+2].src).attr("alt",d.images_json[d.current_index+2].txt).addClass("withtransition card-third").appendTo(this).hide();e.one("loadc",function(){if(a(this).attr("alt").length>0&&1==d.hover_caption){var b=a(this).parent().find(".current-caption").html(a(this).attr("alt"));a(this).hover(function(){var c=a(this).width()+"px",d=a(this).height()/2+"px",e=a(this).position().left+"px";b.css({position:"absolute",width:c,"max-height":d,bottom:"0",left:e}),b.fadeIn()},function(){b.fadeOut()})}f.css("max-height",d.max_height/6+"px").show(),g.css("max-height",d.max_height/12+"px").show(),a(this).parent().find(d.next_class).each(function(){a(this).click(function(){h()})})}),e[0].complete?e.trigger("loadc"):e.one("load",function(){e.trigger("loadc")})}return this}}(jQuery),function(a){a.fn.matchImgHeight=function(b){var c=a.extend({height:200},b);return this.find("img").each(function(){var b,d;a(this).attr("width")&&(b=a(this).attr("width")/a(this).attr("height"),d=b*c.height,a(this).attr("width",d),a(this).width(d)),a(this).attr("height",c.height),a(this).height(c.height)}),this}}(jQuery),function(a){var b=jQuery.event,c=function(a,b,c,d){var e,f,g,h,i,j,k,l,m;for(e=0;e<b.length;e++)for(f=b[e],h=f.indexOf(".")<0,h||(k=f.split("."),f=k.shift(),l=new RegExp("(^|\\.)"+k.slice(0).sort().join("\\.(?:.*\\.)?")+"(\\.|$)")),g=(a[f]||[]).slice(0),i=0;i<g.length;i++)j=g[i],m=h||l.test(j.namespace),m&&(d?j.selector===d&&c(f,j.origHandler||j.handler):null===d?c(f,j.origHandler||j.handler,j.selector):j.selector||c(f,j.origHandler||j.handler))};b.find=function(b,d,e){var f=(a._data(b)||{}).events,g=[];return f?(c(f,d,function(a,b){g.push(b)},e),g):g},b.findBySelector=function(b,d){var e=a._data(b).events,f={},g=function(a,b,c){var d=f[a]||(f[a]={}),e=d[b]||(d[b]=[]);e.push(c)};return e?(c(e,d,function(a,b,c){g(c||"",a,b)},null),f):f},b.supportTouch="ontouchend"in document,a.fn.respondsTo=function(c){return this.length?b.find(this[0],a.isArray(c)?c:[c]).length>0:!1},a.fn.triggerHandled=function(b,c){return b="string"==typeof b?a.Event(b):b,this.trigger(b,c),b.handled},b.setupHelper=function(c,d,e){e||(e=d,d=null);var f=function(f){var g,h=f.selector||"";h?(g=b.find(this,c,h),g.length||a(this).delegate(h,d,e)):b.find(this,c,h).length||b.add(this,d,e,{selector:h,delegate:this})},g=function(f){var g,h=f.selector||"";h?(g=b.find(this,c,h),g.length||a(this).undelegate(h,d,e)):b.find(this,c,h).length||b.remove(this,d,e,{selector:h,delegate:this})};a.each(c,function(){b.special[this]={add:f,remove:g,setup:function(){},teardown:function(){}}})}}(jQuery),function(a){var b=/Phantom/.test(navigator.userAgent),c=!b&&"ontouchend"in document,e=c?"touchstart":"mousedown",f=c?"touchend":"mouseup",g=c?"touchmove":"mousemove",h=function(b){var c=b.originalEvent.touches?b.originalEvent.touches[0]:b;return{time:(new Date).getTime(),coords:[c.pageX,c.pageY],origin:a(b.target)}},i=a.event.swipe={delay:500,max:75,min:30};a.event.setupHelper(["swipe","swipeleft","swiperight","swipeup","swipedown"],e,function(b){function l(a){c&&(d=h(a),Math.abs(c.coords[0]-d.coords[0])>10&&a.preventDefault())}var d,c=h(b),e=b.delegateTarget||b.currentTarget,j=b.handleObj.selector,k=this;a(document.documentElement).bind(g,l).one(f,function(f){if(a(this).unbind(g,l),c&&d){var h=Math.abs(c.coords[0]-d.coords[0]),m=Math.abs(c.coords[1]-d.coords[1]),n=Math.sqrt(h*h+m*m);if(d.time-c.time<i.delay&&n>=i.min){var o=["swipe"];h>=i.min&&m<i.min?o.push(c.coords[0]>d.coords[0]?"swipeleft":"swiperight"):m>=i.min&&h<i.min&&o.push(c.coords[1]<d.coords[1]?"swipedown":"swipeup"),a.each(a.event.find(e,o,j),function(){this.call(k,b,{start:c,end:d})})}}c=d=void 0})})}(jQuery),function(a){a.fn.removeWhitespace=function(){return this.contents().filter(function(){return 3==this.nodeType&&!/\S/.test(this.nodeValue)}).remove(),this}}(jQuery),function(a){a.fn.collageCaption=function(b){var c={images:a(this).children(),background:"black",opacity:"0.5",speed:0,cssClass:"Caption",behaviour_c:0},d=a.extend({},c,b);return this.each(function(){return d.images.each(function(b){var c=a(this),e=c.find("img").height()/2;if("undefined"!=typeof c.data("caption")&&0!=c.data("caption").length){var f='<div class="'+d.cssClass+'" style="position:relative;"><div class="Caption_Background" style="background-color:'+d.background+";opacity:"+d.opacity+';position:relative;top:0;"></div><div class="Caption_Content" style="position:relative;">'+c.data("caption")+"</div></div>";c.append(f);var g=c.find("."+d.cssClass),h=c.find(".Caption_Background"),i=c.find(".Caption_Content"),j=Math.min(g.height(),e);h.height(j),i.css("top","-"+j+"px"),g.css("top",-1*j),0==d.behaviour_c&&(g.hide(),c.bind({mouseenter:function(a){g.find(".Caption_Content").html().length>0&&g.fadeIn()},mouseleave:function(a){g.find(".Caption_Content").html().length>0&&g.fadeOut()}})),1==d.behaviour_c&&c.bind({mouseenter:function(a){g.find(".Caption_Content").html().length>0&&g.fadeOut()},mouseleave:function(a){g.find(".Caption_Content").html().length>0&&g.fadeIn()}})}}),this})}}(jQuery),jQuery(document).ajaxSuccess(function(){jQuery().magnificPopup&&(jQuery(".fbalbum").each(function(){jQuery(this).magnificPopup({delegate:"a.aimg",type:"image",gallery:{enabled:!0},image:{titleSrc:"data-title"},zoom:{enabled:!0,duration:300,easing:"ease-in-out",opener:function(a){return a.is("img")?a:a.find("img")}}})}),jQuery(".jtubegallery").each(function(){jQuery(this).magnificPopup({delegate:".magpopif",type:"iframe"})})),jQuery(".fbalbum").one("mouseenter",function(){jQuery(".Caption_Content").each(function(){jQuery(this).click(function(a){var b=jQuery(this).parent().prev();"gallery"==b.data("gallery")?window.location=b.attr("href"):b.click()})})}),jQuery("a.aimg").click(function(){setTimeout(function(){jQuery(".mfp-figure").on("swipeleft",function(){jQuery(".mfp-arrow-right").click()}).on("swiperight",function(){jQuery(".mfp-arrow-left").click()})},100)})}),jQuery(document).ready(function(){jQuery().magnificPopup&&(jQuery(".fbalbum").each(function(){jQuery(this).magnificPopup({delegate:"a.aimg",type:"image",gallery:{enabled:!0},image:{titleSrc:"data-title"},zoom:{enabled:!0,duration:300,easing:"ease-in-out",opener:function(a){return a.is("img")?a:a.find("img")}}})}),jQuery(".jtubegallery").each(function(){jQuery(this).magnificPopup({delegate:".magpopif",type:"iframe"})})),jQuery(".fbalbum").one("mouseenter",function(){jQuery(".Caption_Content").each(function(){jQuery(this).click(function(a){var b=jQuery(this).parent().prev();"gallery"==b.data("gallery")?window.location=b.attr("href"):b.click()})})}),jQuery("a.aimg").click(function(){setTimeout(function(){jQuery(".mfp-figure").on("swipeleft",function(){jQuery(".mfp-arrow-right").click()}).on("swiperight",function(){jQuery(".mfp-arrow-left").click()})},100)})}),function(a){a.fn.autoscrollElastislide=function(b){var c={interval:0,direction:0},d=a(this),e=a.extend({},c,b);return setTimeout(function(){e.interval>0&&setInterval(function(){0==e.direction?d.parent().next().find(".elastislide-next:hidden").length?e.direction=1:d.parent().next().find(".elastislide-next").trigger("mousedown"):d.parent().next().find(".elastislide-prev:hidden").length?e.direction=0:d.parent().next().find(".elastislide-prev").trigger("mousedown")},1e3*e.interval)},100),this}}(jQuery);