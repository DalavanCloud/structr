/*
 *  Copyright (C) 2012 Axel Morgner
 *
 *  This file is part of structr <http://structr.org>.
 *
 *  structr is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  structr is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with structr.  If not, see <http://www.gnu.org/licenses/>.
 */

var resources;
var previews, previewTabs;
var selStart, selEnd;
var sel;
var contentSourceId, elementSourceId, rootId;

$(document).ready(function() {
    Structr.registerModule('resources', _Resources);
});

var _Resources = {

    icon : 'icon/page.png',
    add_icon : 'icon/page_add.png',
    delete_icon : 'icon/page_delete.png',

    init : function() {
        Structr.classes.push('resource');
    },

    onload : function() {
        activeTab = $.cookie('structrActiveTab');
        console.log('value read from cookie', activeTab);

        //Structr.activateMenuEntry('resources');
        if (debug) console.log('onload');
        main.append('<table id="resourcesEditor"><tr><td id="previews"></td><td id="resources"></td><td id="components"></td><td id="elements"></td><td id="contents"></td></tr></table>');

        resources = $('#resources');
        components = $('#components');
        elements = $('#elements');
        contents = $('#contents');
        previews = $('#previews');
        if (palette) palette.remove();
        main.before('<div id="palette"></div>');
        palette = $('#palette');
        elements = $('#elements', main);
        //main.before('<div id="hoverStatus">Hover status</div>');
        $('#controls', main).remove();
        main.children().first().before('<div id="controls"><input type="checkbox" id="toggleResources">Show Resource Tree <input type="checkbox" id="toggleComponents">Show Components <input type="checkbox" id="toggleElements">Show Elements <input type="checkbox" id="toggleContents">Show Contents</div>');

        previews.append('<ul id="previewTabs"></ul>');
        previewTabs = $('#previewTabs', previews);

        $('#toggleResources').on('click', function(){
            resources.children().each(function(i,v) {
                $(this).toggle();
            });
        });

        $('#toggleComponents').on('click', function(){
            components.children().each(function(i,v) {
                $(this).toggle();
            });
        });

        $('#toggleElements').on('click', function(){
            elements.children().each(function(i,v) {
                $(this).toggle();
            });
        });

        $('#toggleContents').on('click', function(){
            contents.children().each(function(i,v) {
                $(this).toggle();
            });
        });


        //        main.before('<div id="offset">Offset</div>');
        //        previews.append('<div id="sliderBox"><div id="sliderValue"></div><div id="slider"></div></div>');
        //        console.log($("#slider"));
        //        $("#slider").slider({
        //            value: 100,
        //            min: 0,
        //            max: 100,
        //            slide: function(event,ui) {
        //                //$('#sliderValue').text(ui.value);
        //                _Resources.zoomPreviews(ui.value);
        //            }
        //        });

        _Resources.refresh();
        _Resources.refreshComponents();
        _Resources.refreshElements();
        _Elements.showPalette();
        _Contents.refresh();

        previewTabs.append('<li id="import_page" class="button"><img class="add_button icon" src="icon/page_white_put.png"></li>');
        $('#import_page', previewTabs).on('click', function() {
			
            var dialog = $('#dialogText');
            var dialogMsg = $('#dialogMsg');
			
            dialog.empty();
            dialogMsg.empty();

            dialog.append('<table class="props"><tr><td><label for="address">Address:</label></td><td><input id="_address" name="address" size="20" value="http://"></td></tr>'
                + '<tr><td><label for="address">Name of new page:</label></td><td><input id="_name" name="name" size="20"></td></tr>'
                + '<tr><td><label for="address">Timeout (ms)</label></td><td><input id="_timeout" name="timeout" size="20" value="5000"></td></tr></table>');

            var addressField = $('#_address', dialog);

            console.log('addressField', addressField);

            addressField.on('blur', function() {
                var addr = $(this).val().replace(/\/+$/, "");
                console.log(addr);
                $('#_name', dialog).val(addr.substring(addr.lastIndexOf("/")+1));
            });

            dialog.append('<button id="startImport">Start Import</button>');




            Structr.dialog('Import page from URL',
			 
                function() {
                    return true;
                },
			 
                function() {
                    return true;
                }
                );
			
            $('#startImport').on('click', function() {

                var address = $('#_address', dialog).val();
                var name    = $('#_name', dialog).val();
                var timeout = $('#_timeout', dialog).val();

                console.log('start');
                return _Resources.importPage(this, address, name, timeout);
            });
			
            
        });

        previewTabs.append('<li id="add_resource" class="button"><img class="add_button icon" src="icon/add.png"></li>');
        $('#add_resource', previewTabs).on('click', function() {
            _Resources.addResource(this);
        });


    //        main.height($(window).height()-header.height()-palette.height()-24);

    },
	
    importPage : function(button, address, name, timeout) {
        var data = '{ "command" : "IMPORT" , "data" : { "address" : "' + address + '", "name" : "' + name + '", "timeout" : ' + timeout + '} }';
        console.log(data);
        return send(data);
    },

    refresh : function() {
        resources.empty();
        if (_Resources.show()) {
            resources.append('<button class="add_resource_icon button"><img title="Add Resource" alt="Add Resource" src="' + _Resources.add_icon + '"> Add Resource</button>');
            $('.add_resource_icon', main).on('click', function() {
                _Resources.addResource(this);
            });
        }

    },

    refreshComponents : function() {
        components.empty();
        if (_Components.show()) {
            components.append('<button class="add_component_icon button"><img title="Add Component" alt="Add Component" src="' + _Components.add_icon + '"> Add Component</button>');
            $('.add_component_icon', main).on('click', function() {
                _Resources.addComponent(this);
            });
        }
    },

    refreshElements : function() {
        _Elements.refresh();
    },

    show : function() {
        return _Entities.showEntities('Resource');
    },

    showElements : function() {
        return _Resources.showEntities('Element');
    },

    addTab : function(entity) {
        previewTabs.children().last().before(''
            + '<li id="show_' + entity.id + '" class="button '
            + entity.id + '_'
            + '"><b class="name_">' + entity.name + '</b><!--a target="_blank" href="' + viewRootUrl + entity.name + '"><img title="View ' + entity.name + ' in new window" alt="View ' + entity.name + ' in new window" src="icon/eye.png">'
            + '</a--></li>');

        var tab = $('#show_' + entity.id, previews);
        tab.append('<img title="Delete resource \'' + entity.name + '\'" alt="Delete resource \'' + entity.name + '\'" class="delete_icon button" src="' + Structr.delete_icon + '">');
        var icon = $('.delete_icon', tab);
        icon.hide();
        icon.on('click', function(e) {
            e.stopPropagation();
            //var self = $(this);
            //console.log('delete icon clicked', self);
            //e.stopPropagation();
            //icon.off('click');
            //icon.off('mouseover');
            _Resources.deleteResource(this, entity);
        });
        icon.on('mouseover', function(e) {
            var self = $(this);
            self.show();
        //e.stopPropagation();
        //var icon = $(this);
        //console.log('icon', self);
        //e.stopPropagation();
        //icon.off('click');
        //icon.off('mouseover');
        });

        return tab;
    },

    resetTab : function(element, name) {

        console.log('resetTab', element);

        element.children('input').hide();
        element.children('.name_').show();
        
        var icon = $('.delete_icon', element);
        //icon.hide();

        element.hover(function(e) {
            icon.show();
        },
        function(e) {
            icon.hide();
        });

//        element.on('dblclick', function(e) {
//            var self = $(this);
//            self.off('click');
//            e.stopPropagation();
//            _Resources.resetTab(self);
//            window.open(viewRootUrl + name);
//        });

        element.on('click', function(e) {
            var self = $(this);
            var clicks = e.originalEvent.detail;
            if (clicks == 1) {
                console.log('click', self, self.css('z-index'));
                if (self.hasClass('active')) {
                    _Resources.makeTabEditable(self);
                } else {
                    _Resources.activateTab(self);
                }
            } else if (clicks == 2) {
                self.off('click');
                e.stopPropagation();
                _Resources.resetTab(self);
                window.open(viewRootUrl + name);
            }
        });

        if (getId(element) == activeTab) {
            _Resources.activateTab(element);
        }
    },

    activateTab : function(element) {
        
        var name = $.trim(element.children('b.name_').text());
        console.log('activateTab', element, name);

        previewTabs.children('li').each(function() {
            $(this).removeClass('active');
        });

        $('.preview_box', previews).each(function() {
            $(this).hide();
        });
        //var id = $(this).attr('id').substring(5);

        var id = getId(element);
        activeTab = id;

        var iframe = $('#preview_' + id);
        console.log(iframe);
        iframe.attr('src', viewRootUrl + name + '?edit');
        iframe.parent().show();
        iframe.on('load', function() {
            console.log('iframe loaded', $(this));
        });

        element.addClass('active');

    },

    makeTabEditable : function(element) {
        //element.off('dblclick');
        element.off('hover');
        var oldName = $.trim(element.children('b').text());
        //console.log('oldName', oldName);
        element.children('b').hide();
        element.children('img').hide();
        element.append('<input type="text" size="' + (oldName.length+4) + '" class="newName_" value="' + oldName + '">');

        var input = $('input', element);
        //        input.on('focus', function(e) {
        //            e.preventDefault();
        //            $(this).select();
        //        });

        input.focus().select();

        //        input.on('blur', function() {
        //            _Resources.resetTab(element, oldName);
        //        });

        input.on('blur', function() {
            var self = $(this);
            //self.off('dblclick');
            var newName = self.val();
            //console.log('new name', $.trim(newName));
            _Entities.setProperty(getId(element), "name", newName);
            _Resources.resetTab(element, newName);
        });
        element.off('click');

    },

    appendResourceElement : function(entity, resourceId, rootId) {

        resources.append('<div class="node resource ' + entity.id + '_"></div>');
        var div = $('.' + entity.id + '_', resources);

        div.append('<img title="Expand resource \'' + entity.name + '\'" alt="Expand resource \'' + entity.name + '\'" class="expand_icon button" src="' + Structr.expand_icon + '">');

        $('.expand_icon', div).on('click', function() {
            _Resources.toggleResource(this, entity);
        });


        div.append('<img class="typeIcon" src="icon/page.png">'
            + '<b class="name_">' + entity.name + '</b> <span class="id">' + entity.id + '</span>');

        div.append('<img title="Delete resource \'' + entity.name + '\'" alt="Delete resource \'' + entity.name + '\'" class="delete_icon button" src="' + Structr.delete_icon + '">');

        div.append('<img title="Link resource \'' + entity.name + '\' to current selection" alt="Link resource \'' + entity.name + '\' to current selection" class="link_icon button" src="' + Structr.link_icon + '">');
        $('.link_icon', div).on('click', function() {
            //console.log(rootId, sourceId);
            if (sourceId && selStart && selEnd) {
                // function(resourceId, sourceId, linkedResourceId, startOffset, endOffset)
                _Resources.linkSelectionToResource(rootId, sourceId, entity.id, selStart, selEnd);
            //$('.link_icon').hide();
            }
        });

        $('.delete_icon', div).on('click', function(e) {
            e.stopPropagation();
            var self = $(this);
            self.off('click');
            self.off('mouseover');
            _Resources.deleteResource(this, entity);
        });
        //        div.append('<img class="add_icon button" title="Add Element" alt="Add Element" src="icon/add.png">');
        //        $('.add_icon', div).on('click', function() {
        //            Resources.addElement(this, resource);
        //        });
        $('b', div).on('click', function(e) {
            e.stopPropagation();
            var self = $(this);
            self.off('click');
            self.off('mouseover');
            _Entities.showProperties(this, entity, 'all');
        });

        //        previewTabs.children('li').each(function() {
        //            $(this).removeClass('active');
        //        });
        var tab = _Resources.addTab(entity);

        previews.append('<div class="preview_box"><iframe id="preview_'
            + entity.id + '"></iframe></div><div style="clear: both"></div>');

        _Resources.resetTab(tab, entity.name);

        //        $('#show_' + entity.id, previews).on('dblclick', function(e) {
        //            var self = $(this);
        //            self.off('click');
        //            e.stopPropagation();
        //            _Resources.resetTab(self);
        //            window.open(viewRootUrl + entity.name);
        //        });

        //        tab.on('click', function(e) {
        //            e.stopPropagation();
        //            e.preventDefault();
        //            var self = $(this);
        //
        //            if (self.hasClass('active')) {
        //                _Resources.makeTabEditable(self);
        //            } else {
        //                _Resources.activateTab(self);
        //            }
        //        });
        //
        //        tab.hover(function(e) {
        //            //e.stopPropagation();
        //            var self = $(this);
        //            //            console.log('in', self);
        //            self.append('<img title="Delete resource \'' + entity.name + '\'" alt="Delete resource \'' + entity.name + '\'" class="delete_icon button" src="' + Structr.delete_icon + '">');
        //            self.children('.delete_icon').on('click', function(e) {
        //                var icon = $(this);
        //                console.log('icon', icon);
        //                //e.stopPropagation();
        //                icon.off('click');
        //                icon.off('mouseover');
        //                _Resources.deleteResource(this, entity);
        //            });
        //        },
        //        function(e) {
        //            e.stopPropagation();
        //            var self = $(this);
        //            //            console.log('out', self);
        //            self.find('.delete_icon').remove();
        //        });
        $('#preview_' + entity.id).hover(function() {
            var self = $(this);
            var elementContainer = self.contents().find('.structr-element-container');
            //console.log(self, elementContainer);
            elementContainer.addClass('structr-element-container-active');
            elementContainer.removeClass('structr-element-container');
        }, function() {
            var self = $(this);
            var elementContainer = self.contents().find('.structr-element-container-active');
            //console.log(elementContainer);
            elementContainer.addClass('structr-element-container');
            elementContainer.removeClass('structr-element-container-active');
        //self.find('.structr-element-container-header').remove();
        });

        $('#preview_' + entity.id).load(function() {

            //            previewTabs.children('button').each(function() {
            //                $(this).removeClass('active');
            //            });
            //
            //            previewTabs.children('#show_' + resource.id).addClass('active');

            //console.log('Preview ' + resource.id + ' offset: ', $(this).offset());
            var offset = $(this).offset();

            //console.log(this);
            var doc = $(this).contents();
            var head = $(doc).find('head');
            if (head) head.append('<style type="text/css">'
                + '* { z-index: 0}\n'
                + '.structr-content-container { display: inline-block; border: none; margin: 0; padding: 0; min-height: 10px; min-width: 10px; }\n'
                + '.structr-element-container-active { display; inline-block; border: 1px dotted #e5e5e5; min-height: 10px; min-width: 10px; }\n'
                + '.structr-element-container { }\n'
                + '.structr-element-container-active:hover { border: 1px dotted red; }\n'
                + '.structr-droppable-area { border: 1px dotted red; }\n'
                + '.structr-editable-area { border: 1px dotted orange; margin: -1px; padding: 0; }\n'
                + '.structr-editable-area-active { background-color: #ffe; border: 1px solid orange; color: #333; margin: -1px; padding: 0; }'
                + '.structr-element-container-header { float: right; font-size: 8pt; }'
                + '.structr-element-container-header img { float: right; padding-top: -16px; padding-right: -16px; filter: alpha(opacity=80); -khtml-opacity: 0.8; -moz-opacity: 0.8; opacity: 0.8; }'
                + '.link-hover { border: 1px solid #00c; }'
                + '.structr-node { color: #333; line-height: 1.7em; border-radius: 5px; border: 1px solid #a5a5a5; padding: 3px 6px; margin: 6px 0 0 0; background-color: #eee; background: -webkit-gradient(linear, left bottom, left top, from(#ddd), to(#eee)) no-repeat; background: -moz-linear-gradient(90deg, #ddd, #eee) no-repeat; filter: progid:DXImageTransform.Microsoft.Gradient(StartColorStr="#eeeeee", EndColorStr="#dddddd", GradientType=0);'
                + '</style>');
	
            var iframeDocument = $(this).contents();
            var iframeWindow = this.contentWindow;

            var droppables = iframeDocument.find('[structr_element_id]');

            if (droppables.length == 0) {

                //iframeDocument.append('<html structr_element_id="' + entity.id + '">dummy element</html>');
                var html = iframeDocument.find('html');
                html.attr('structr_element_id', entity.id);
                html.addClass('structr-element-container');

            }
            droppables = iframeDocument.find('[structr_element_id]');

            droppables.each(function(i,element) {
                //console.log(element);
                var el = $(element);

                //var depth = el.parents().length;
                //console.log('depth: ' + depth);
                //console.log('z-index before: ' + el.css('z-index'));
                //el.css('z-index', depth);
                //console.log('z-index after: ' + el.css('z-index'));
                
                el.droppable({
                    accept: '.element, .content',
                    greedy: true,
                    hoverClass: 'structr-droppable-area',
                    iframeOffset: {
                        'top' : offset.top,
                        'left' : offset.left
                    },
                    drop: function(event, ui) {
                        var resource = $(this).closest( '.resource')[0];
                        var resourceId;
                        var pos;

                        if (resource) {

                            // we're in the main page
                            resourceId = getIdFromClassString($(resource).attr('class'));
                            pos = $('.content, .element', $(this)).length;

                        } else {
                            
                            // we're in the iframe
                            resource = $(this).closest('[structr_resource_id]')[0];
                            resourceId = $(resource).attr('structr_resource_id');
                            pos = $('[structr_element_id]', $(this)).length;
                        }
                        
                        //console.log('Dropped on: ' , $(this));
                        //console.log('ui: ' , ui);
                        //console.log('Resource: ' , resource);
                        //console.log('ResourceId: ' + resourceId);
                        var contentId = getIdFromClassString(ui.draggable.attr('class'));
                        var elementId = getIdFromClassString($(this).attr('class'));

                        if (!elementId) elementId = $(this).attr('structr_element_id');

                        if (!contentId) {
                            // create element on the fly
                            //var el = _Elements.addElement(null, 'element', null);
                            var tag = $(ui.draggable).text();
                        //var el = _Elements.addElement(null, 'Element', '"tag":"' + tag + '"');
                        //if (debug) console.log(el);
                        //contentId = el.id;
                        //console.log('Created new element on the fly: ' + contentId);
                        }
                        

                        
                        if (resourceId) {
                            props = '"resourceId" : "' + resourceId + '", "' + resourceId + '" : "' + pos + '"';
                        } else {
                            props = '"*" : "' + pos + '"';
                        }

                        var props;

                        if (!contentId) {
                            props += ', "name" : "New ' + tag + ' ' + Math.floor(Math.random() * (999999 - 1)) + '", "type" : "' + tag.capitalize() + '"' + (tag != 'content' ? ', "tag" : "' + tag + '"' : '');
                        }
                        //console.log('Content Id: ' + contentId);
                        //console.log('Target Id: ' + elementId);
                        //console.log('Position: ' + pos);
                        //console.log(props);
                        _Entities.addSourceToTarget(contentId, elementId, props);
                    }
                });

                var structrId = el.attr('structr_element_id');
                var type = el.attr('structr_type');
                var name = el.attr('structr_name');
                if (structrId) {
                    
                    el.append('<div class="structr-element-container-header">'
                        + '<img class="delete_icon structr-container-button" title="Delete ' + structrId + '" alt="Delete ' + structrId + '" src="/structr/icon/delete.png">'
                        + '<img class="edit_icon structr-container-button" title="Edit properties of ' + structrId + '" alt="Edit properties of ' + structrId + '" src="/structr/icon/application_view_detail.png">'
                        + '<img class="move_icon structr-container-button" title="Move ' + structrId + '" alt="Move ' + structrId + '" src="/structr/icon/arrow_move.png">'
                        + '<div class="structr-node ' + type + '">' + name + '</div>'
                        + '</div>'
                        );

                    el.find('.structr-node').hide();

                    $('.move_icon', el).on('mousedown', function(e) {
                        e.stopPropagation();
                        var self = $(this);
                        var element = self.closest('[structr_element_id]');
                        //var element = self.children('.structr-node');
                        console.log(element);
                        var entity = Structr.entity(structrId, element.attr('structr_element_id'));
                        entity.type = element.attr('structr_type');
                        entity.name = element.attr('structr_name');
                        console.log('move', entity);
                        //var parentId = element.attr('structr_element_id');
                        self.parent().children('.structr-node').show();
                    });

                    $('.edit_icon', el).on('click', function(e) {
                        e.stopPropagation();
                        var self = $(this);
                        var element = self.closest('[structr_element_id]');
                        var entity = Structr.entity(structrId, element.attr('structr_element_id'));
                        entity.type = element.attr('structr_type');
                        entity.name = element.attr('structr_name');
                        console.log('edit', entity);
                        //var parentId = element.attr('structr_element_id');
                        console.log(element);
                        Structr.dialog('Edit Properties of ' + entity.id, function() {
                            console.log('save')
                        }, function() {
                            console.log('cancelled')
                        });
                        _Entities.showProperties(this, entity, 'all', $('#dialogText'));
                    });

                    $('.delete_icon', el).on('click', function(e) {
                        e.stopPropagation();
                        var self = $(this);
                        var element = self.closest('[structr_element_id]');
                        var entity = Structr.entity(structrId, element.attr('structr_element_id'));
                        entity.type = element.attr('structr_type');
                        entity.name = element.attr('structr_name');
                        console.log('delete', entity);
                        var parentId = element.attr('structr_element_id');

                        _Entities.removeSourceFromTarget(entity.id, parentId);
                        deleteNode(this, entity);
                    });
                    $('.structr-element-container-header', el).hide();

                    el.hover(function(e) {
                        e.stopPropagation();
                        var header = $(this).children('.structr-element-container-header');
                        header.show();
                    },
                    function(e) {
                        e.stopPropagation();
                        var header = $(this).children('.structr-element-container-header');
                        header.hide();
                    });
                //                        ,
                //                        click: function() {
                //                            var self = $(this);
                //                            //self.addClass('structr-editable-area-active');
                //                            sel = iframeWindow.getSelection();
                //                            if (sel.rangeCount) {
                //                                selStart = sel.getRangeAt(0).startOffset;
                //                                selEnd = sel.getRangeAt(0).endOffset;
                //                                console.log(selStart, selEnd);
                //                                $('.link_icon').show();
                //                                //                                sourceId = structrId;
                //                                elementSourceId = self.attr('structr_element_id');
                //                                if (debug) console.log('sourceId: ' + elementSourceId);
                //                                var rootResourceElement = self.closest('html')[0];
                //                                console.log(rootResourceElement);
                //                                if (rootResourceElement) {
                //                                    rootId = $(rootResourceElement).attr('structr_element_id');
                //                                }
                //
                //                            }
                //                        }

                }
            });

            $(this).contents().find('[structr_content_id]').each(function(i,element) {
                if (debug) console.log(element);
                var el = $(element);
                var structrId = el.attr('structr_content_id');
                if (structrId) {
                    
                    el.on({
                        mouseover: function(e) {
                            e.stopPropagation();
                            var self = $(this);
                            self.addClass('structr-editable-area');
                            self.attr('contenteditable', true);
                            //swapFgBg(self);
                            //self.addClass('structr-editable-area');
                            //self.attr('contenteditable', true);
                            //if (debug) console.log(self);
                            $('#hoverStatus').text('Editable content element: ' + self.attr('structr_content_id'));
                        },
                        mouseout: function(e) {
                            e.stopPropagation();
                            var self = $(this);
                            //swapFgBg(self);
                            self.removeClass('structr-editable-area');
                            //self.attr('contenteditable', false);
                            $('#hoverStatus').text('-- non-editable --');
                        },
                        click: function(e) {
                            e.stopPropagation();
                            var self = $(this);
                            self.removeClass('structr-editable-area');
                            self.addClass('structr-editable-area-active');

                            //swapFgBg(self);
                            sel = iframeWindow.getSelection();
                            if (sel.rangeCount) {
                                selStart = sel.getRangeAt(0).startOffset;
                                selEnd = sel.getRangeAt(0).endOffset;
                                if (debug) console.log(selStart, selEnd);
                                $('.link_icon').show();
                                //                                sourceId = structrId;
                                contentSourceId = self.attr('structr_content_id');
                                if (debug) console.log('click contentSourceId: ' + contentSourceId);
                                var rootResourceElement = self.closest('html')[0];
                                if (debug) console.log(rootResourceElement);
                                if (rootResourceElement) {
                                    rootId = $(rootResourceElement).attr('structr_content_id');
                                }
								
                            }
                        },
                        blur: function(e) {
                            e.stopPropagation();
                            var self = $(this);
                            if (debug) console.log('blur contentSourceId: ' + contentSourceId);
                            _Resources.updateContent(contentSourceId, self.text());
                            contentSourceId = null;
                            self.attr('contenteditable', false);
                            self.removeClass('structr-editable-area-active');
                        //sswapFgBg(self);
                        //$('.link_icon').hide();
                        //Resources.reloadPreviews();
                        }
                    });
                //                    el.droppable({
                //                        //accept: '.resource',
                //                        hoverClass: 'link-hover',
                ////						over: function(event, ui) {
                ////                            var resourceId = getIdFromClassString(ui.draggable.attr('class'));
                ////                            var sourceId = $(this).attr('structr_id');
                ////                            console.log('Resource ' + resourceId + ' dropped onto ', this);
                ////                            //var sel = iframeWindow.getSelection();
                ////                            if (sel && sel.rangeCount) {
                ////                                selStart = sel.getRangeAt(0).startOffset;
                ////                                selEnd = sel.getRangeAt(0).endOffset;
                ////                                console.log(selStart, selEnd);
                ////                            }
                ////						},
                //                        drop: function(event, ui) {
                //                            console.log(event,ui);
                //                            var resourceId = getIdFromClassString(ui.draggable.attr('class'));
                //                            var sourceId = $(this).attr('structr_id');
                //                            console.log('Resource ' + resourceId + ' dropped onto ', this);
                //                            //var sel = iframeWindow.getSelection();
                //                            if (sel && sel.rangeCount) {
                //                                selStart = sel.getRangeAt(0).startOffset;
                //                                selEnd = sel.getRangeAt(0).endOffset;
                //                                console.log(selStart, selEnd);
                //
                //                                Resources.linkSelectionToResource(sourceId, resourceId, selStart, selEnd);
                //
                //                            }
                //                        }
                //                    });
                }
            });
        });
    //        var elements = resource.children;
    //
    //        if (elements && elements.length > 0) {
    //            disable($('.delete_icon', div));
    //            $(elements).each(function(i, child) {
    //
    //                if (debug) console.log("type: " + child.type);
    //                if (child.type == "Element") {
    //                    Resources.appendElementElement(child, resource.id);
    //                } else if (child.type == "Content") {
    //                    Resources.appendContentElement(child, resource.id);
    //                }
    //            });
    //        }

    //        div.draggable({
    //            iframeFix: true,
    //            refreshPositions: true,
    //            revert: 'invalid',
    //            //containment: '#main',
    //            zIndex: 1,
    //			start: function() {
    //				//$(this).data('draggable').offset.click.top += 1000;
    //			}
    //            //helper: 'clone'
    //        //            ,
    //        //            stop : function(event, ui) {
    //        //                console.log(ui);
    //        //            }
    //        });
        
    //        div.droppable({
    //            accept: '.component, .element',
    //            greedy: true,
    //            hoverClass: 'resourceHover',
    //            drop: function(event, ui) {
    //                var componentId = getIdFromClassString(ui.draggable.attr('class'));
    //                var resourceId = getIdFromClassString($(this).attr('class'));
    //
    //                if (!resourceId) resourceId = '*';
    //
    //                var pos = $('.component, .element', $(this)).length;
    //                if (debug) console.log(pos);
    //                var props = '"' + resourceId + '" : "' + pos + '"';
    //                if (debug) console.log(props);
    //                _Entities.addSourceToTarget(componentId, resourceId, props);
    //            }
    //        });

    //return div;
    },

    appendElementElement : function(entity, parentId, resourceId) {
        if (debug) console.log('Resources.appendElementElement');
        var div = _Elements.appendElementElement(entity, parentId, resourceId);
        //console.log(div);
        if (parentId) {

            $('.delete_icon', div).remove();
            div.append('<img title="Remove element \'' + entity.name + '\' from resource ' + parentId + '" '
                + 'alt="Remove element ' + entity.name + ' from ' + parentId + '" class="delete_icon button" src="icon/brick_delete.png">');
            $('.delete_icon', div).on('click', function(e) {
                e.stopPropagation();
                var self = $(this);
                self.off('click');
                self.off('mouseover');
                _Entities.removeSourceFromTarget(entity.id, parentId);
            });
        }
        //        var elements = element.children;
        //
        //        if (elements && elements.length > 0) {
        //            disable($('.delete_icon', div));
        //            $(elements).each(function(i, child) {
        //                if (child.type == "Element") {
        //                    Resources.appendElementElement(child, element.id);
        //                } else if (child.type == "Content") {
        //                    Resources.appendContentElement(child, element.id);
        //                }
        //            });
        //        }

        var resource = div.closest( '.resource')[0];
        if (!resource && resources) {

            div.draggable({
                revert: 'invalid',
                containment: '#main',
                zIndex: 4,
                helper: 'clone'
            });

        }

        div.droppable({
            accept: '.element, .content',
            greedy: true,
            hoverClass: 'elementHover',
            drop: function(event, ui) {

                console.log('appendElementElement', $(this));

                var resource = $(this).closest( '.resource')[0];
                if (debug) console.log(resource);
                var contentId = getIdFromClassString(ui.draggable.attr('class'));
                var elementId = getIdFromClassString($(this).attr('class'));

                if (debug) console.log('Content Id: ' + contentId);
                if (!contentId) {
                    // create element on the fly
                    //var el = _Elements.addElement(null, 'element', null);
                    var tag = $(ui.draggable).text();
                //var el = _Elements.addElement(null, 'Element', '"tag":"' + tag + '"');
                //if (debug) console.log(el);
                //contentId = el.id;
                //if (debug) console.log('Created new element on the fly: ' + contentId);
                }

                var pos = $('.content, .element', $(this)).length;
                if (debug) console.log(pos);
                var props;
                if (resource) {
                    var resourceId = getIdFromClassString($(resource).attr('class'));
                    props = '"resourceId" : "' + resourceId + '", "' + resourceId + '" : "' + pos + '"';
                } else {
                    props = '"*" : "' + pos + '"';
                }

                if (!contentId) {
                    props += ', "name" : "New ' + tag + ' ' + Math.floor(Math.random() * (999999 - 1)) + '", "type" : "' + tag.capitalize() + '", "tag" : "' + tag + '"';
                }

                if (debug) console.log(props);
                _Entities.addSourceToTarget(contentId, elementId, props);
            }
        });

        return div;
    },

    appendComponentElement : function(component, parentId, resourceId) {
        if (debug) console.log('Resources.appendComponentElement');
        var div = _Components.appendComponentElement(component, parentId, resourceId);
        //console.log(div);

        if (parentId) {

            $('.delete_icon', div).remove();
            div.append('<img title="Remove component \'' + component.name + '\' from resource ' + parentId + '" '
                + 'alt="Remove component ' + component.name + ' from ' + parentId + '" class="delete_icon button" src="' + _Components.delete_icon + '">');
            $('.delete_icon', div).on('click', function() {
                _Entities.removeSourceFromTarget(component.id, parentId);
            });

        }
        //        var elements = element.children;
        //
        //        if (elements && elements.length > 0) {
        //            disable($('.delete_icon', div));
        //            $(elements).each(function(i, child) {
        //                if (child.type == "Element") {
        //                    Resources.appendElementElement(child, element.id);
        //                } else if (child.type == "Content") {
        //                    Resources.appendContentElement(child, element.id);
        //                }
        //            });
        //        }
        
        var resource = div.closest( '.resource')[0];
        if (!resource && resources) {

            div.draggable({
                revert: 'invalid',
                containment: '#main',
                zIndex: 1,
                helper: 'clone'
            });

        }


        div.droppable({
            accept: '.element',
            greedy: true,
            hoverClass: 'componentHover',
            drop: function(event, ui) {
                var resource = $(this).closest( '.resource')[0];
                if (debug) console.log(resource);
                var contentId = getIdFromClassString(ui.draggable.attr('class'));
                var componentId = getIdFromClassString($(this).attr('class'));
                var pos = $('.element', $(this)).length;
                if (debug) console.log(pos);
                var props;
                if (resource) {
                    var resourceId = getIdFromClassString($(resource).attr('class'));
                    props = '"resourceId" : "' + resourceId + '", "' + resourceId + '" : "' + pos + '"';
                } else {
                    props = '"*" : "' + pos + '"';
                }
                if (debug) console.log(props);
                _Entities.addSourceToTarget(contentId, componentId, props);
            }
        });

        return div;
    },

    appendContentElement : function(content, parentId, resourceId) {
        if (debug) console.log('Resources.appendContentElement');
		
        var div = _Contents.appendContentElement(content, parentId, resourceId);

        if (parentId) {
            $('.delete_icon', div).remove();
            div.append('<img title="Remove element \'' + content.name + '\' from resource ' + parentId + '" '
                + 'alt="Remove content ' + content.name + ' from element ' + parentId + '" class="delete_icon button" src="' + _Contents.delete_icon + '">');
            $('.delete_icon', div).on('click', function(e) {
                e.stopPropagation();
                var self = $(this);
                self.off('click');
                self.off('mouseover');
                _Entities.removeSourceFromTarget(content.id, parentId)
            });
        }

        div.draggable({
            iframeFix: true,
            revert: 'invalid',
            containment: '#main',
            zIndex: 1,
            helper: 'clone'
        });
        return div;
    },

    addComponentToResource : function(componentId, resourceId) {
        if (debug) console.log('Resources.appendComponentToResource');

        var resource = $('.' + resourceId + '_');
        var component = $('.' + componentId + '_', components);

        var existing = $('.' + componentId + '_', resource);

        if (existing.length) return;

        if (debug) console.log(resource, component);

        var div = component.clone();
        resource.append(div);

        $('.delete_icon', div).remove();


        div.append('<img title="Remove component ' + componentId + ' from resource ' + resourceId + '" '
            + 'alt="Remove component ' + componentId + ' from resource ' + resourceId + '" class="delete_icon button" src="' + _Components.delete_icon + '">');
        $('.delete_icon', div).on('click', function() {
            _Resources.removeComponentFromResource(componentId, resourceId);
        });
        //element.draggable('destroy');

        var numberOfComponents = $('.component', resource).size();
        if (debug) console.log(numberOfComponents);
        if (numberOfComponents > 0) {
            disable($('.delete_icon', resource)[0]);
        }

    },

    addElementToResource : function(elementId, parentId) {
        if (debug) console.log('Resources.appendElementToResource');

        var parent = $('.' + parentId + '_', resources);
        var element = $('.' + elementId + '_', elements);

        //var existing = $('.' + elementId + '_', resource);

        //if (existing.length) return;

        if (debug) console.log(parent, element);
        
        var div = element.clone();
        parent.append(div);

        $('.delete_icon', div).remove();

        div.append('<img title="Remove element ' + elementId + ' from resource ' + parentId + '" '
            + 'alt="Remove element ' + elementId + ' from resource ' + parentId + '" class="delete_icon button" src="' + _Elements.delete_icon + '">');
        $('.delete_icon', div).on('click', function(e) {
            e.stopPropagation();
            var self = $(this);
            self.off('click');
            self.off('mouseover');
            _Resources.removeElementFromResource(elementId, parentId);
        });
        //element.draggable('destroy');

        div.droppable({
            accept: '.element, .content',
            greedy: true,
            hoverClass: 'elementHover',
            drop: function(event, ui) {

                console.log('appendElementElement', $(this));

                var resource = $(this).closest( '.resource')[0];
                if (debug) console.log(resource);
                var contentId = getIdFromClassString(ui.draggable.attr('class'));
                var elementId = getIdFromClassString($(this).attr('class'));

                if (debug) console.log('Content Id: ' + contentId);
                if (!contentId) {
                    // create element on the fly
                    //var el = _Elements.addElement(null, 'element', null);
                    var tag = $(ui.draggable).text();
                //var el = _Elements.addElement(null, 'Element', '"tag":"' + tag + '"');
                //if (debug) console.log(el);
                //contentId = el.id;
                //if (debug) console.log('Created new element on the fly: ' + contentId);
                }

                var pos = $('.content, .element', $(this)).length;
                if (debug) console.log(pos);
                var props;
                if (resource) {
                    var resourceId = getIdFromClassString($(resource).attr('class'));
                    props = '"resourceId" : "' + resourceId + '", "' + resourceId + '" : "' + pos + '"';
                } else {
                    props = '"*" : "' + pos + '"';
                }

                if (!contentId) {
                    props += ', "name" : "New ' + tag + ' ' + Math.floor(Math.random() * (999999 - 1)) + '", "type" : "' + tag.capitalize() + '", "tag" : "' + tag + '"';
                }

                if (debug) console.log(props);
                _Entities.addSourceToTarget(contentId, elementId, props);
            }
        });

        var numberOfElements = $('.element', parent).size();
        if (debug) console.log(numberOfElements);
        if (numberOfElements > 0) {
            disable($('.delete_icon', parent)[0]);
        }

    },

    removeComponentFromResource : function(componentId, resourceId) {
        if (debug) console.log('Resources.removeComponentFromResource');

        var resource = $('.' + resourceId + '_');
        var component = $('.' + componentId + '_', resource);
        component.remove();

        var numberOfComponents = $('.component', resource).size();
        if (debug) console.log(numberOfComponents);
        if (numberOfComponents == 0) {
            enable($('.delete_icon', resource)[0]);
        }
        _Entities.removeSourceFromTarget(componentId, resourceId);

    },

    removeElementFromResource : function(elementId, resourceId) {
        if (debug) console.log('Resources.removeElementFromResource');

        var resource = $('.' + resourceId + '_');
        var element = $('.' + elementId + '_', resource);
        element.remove();

        var numberOfElements = $('.element', resource).size();
        if (debug) console.log(numberOfElements);
        if (numberOfElements == 0) {
            enable($('.delete_icon', resource)[0]);
        }
        _Entities.removeSourceFromTarget(elementId, resourceId);

    },

    addContentToElement : function(contentId, elementId) {
        if (debug) console.log('Resources.addContentToElement');

        var element = $('.' + elementId + '_');
        var content = $('.' + contentId + '_').clone();

        element.append(content);

        $('.delete_icon', content).remove();
        content.append('<img title="Remove content ' + contentId + ' from element ' + elementId + '" '
            + 'alt="Remove content ' + contentId + ' from element ' + elementId + '" class="delete_icon button" src="' + _Contents.delete_icon + '">');
        $('.delete_icon', content).on('click', function() {
            _Resources.removeElementFromResource(contentId, elementId)
        });
        content.draggable('destroy');

        var numberOfContents = $('.element', element).size();
        if (debug) console.log(numberOfContents);
        if (numberOfContents > 0) {
            disable($('.delete_icon', element)[0]);
        }

    },

    removeContentFromElement : function(contentId, elementId) {

        var element = $('.' + elementId + '_');
        var content = $('.' + contentId + '_', element);
        content.remove();

        var numberOfContents = $('.element', element).size();
        if (debug) console.log(numberOfContents);
        if (numberOfContents == 0) {
            enable($('.delete_icon', element)[0]);
        }
        _Entities.removeSourceFromTarget(contentId, elementId);

    },

    updateContent : function(contentId, content) {
        //console.log('update ' + contentId + ' with ' + content);
        var url = rootUrl + 'content' + '/' + contentId;
        if (debug) console.log(content);
        var text = content.replace(/\n/g, '<br>');
        if (debug) console.log(text);
        text = $.quoteString(text);
        var data = '{ "content" : ' + text + ' }';
        $.ajax({
            url: url,
            //async: false,
            type: 'PUT',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            data: data,
            success: function(data) {
            //refreshIframes();
            //keyEventBlocked = true;
            //enable(button);
            //console.log('success');
            }
        });
    },

    addResource : function(button) {
        return _Entities.add(button, 'Resource');
    },

    addComponent : function(button) {
        return _Entities.add(button, 'Component');
    },

    addElement : function(button) {
        return _Entities.add(button, 'Element');
    },
	
    deleteResource : function(button, resource) {
        if (debug) console.log('delete resource ' + resource);
        deleteNode(button, resource);
    },

    showSubEntities : function(resourceId, entity) {
        var follow = followIds(resourceId, entity);
        $(follow).each(function(i, nodeId) {
            if (nodeId) {
                //            console.log(rootUrl + nodeId);
                $.ajax({
                    url: rootUrl + nodeId,
                    dataType: 'json',
                    contentType: 'application/json; charset=utf-8',
                    async: false,
                    //headers: { 'X-User' : 457 },
                    success: function(data) {
                        if (!data || data.length == 0 || !data.result) return;
                        var result = data.result;
                        //                    console.log(result);
                        _Resources.appendElement(result, entity, resourceId);
                        _Resources.showSubEntities(resourceId, result);
                    }
                });
            }
        });
    },

    toggleResource : function(button, resource) {

        if (debug) console.log('toggle resource ' + resource.id);
        var resourceElement = $('.' + resource.id + '_');
        if (debug) console.log(resourceElement);

        var subs = $('.component, .element', resourceElement);
        subs.each(function(i,el){
            $(el).toggle(50, function() {
                if (button.src.endsWith('icon/tree_arrow_down.png')) {
                    button.src = 'icon/tree_arrow_right.png'
                } else {
                    button.src = 'icon/tree_arrow_down.png'
                }

            });
        });


    },

    appendElement : function(entity, parentEntity, resourceId) {
        //    console.log('appendElement: resourceId=' + resourceId);
        //    console.log(entity);
        //    console.log(parentEntity);
        var type = entity.type.toLowerCase();
        var id = entity.id;
        var resourceEntitySelector = $('.' + resourceId + '_');
        var element = (parentEntity ? $('.' + parentEntity.id + '_', resourceEntitySelector) : resourceEntitySelector);
        //    console.log(element);
        _Entities.appendEntityElement(entity, element);

        if (type == 'content') {
            div.append('<img title="Edit Content" alt="Edit Content" class="edit_icon button" src="' + Structr.edit_icon + '">');
            $('.edit_icon', div).on('click', function() {
                editContent(this, resourceId, id)
            });
        } else {
            div.append('<img title="Add" alt="Add" class="add_icon button" src="' + Structr.add_icon + '">');
            $('.add_icon', div).on('click', function() {
                addNode(this, 'content', entity, resourceId)
            });
        }
        //    //div.append('<img class="sort_icon" src="icon/arrow_up_down.png">');
        div.sortable({
            axis: 'y',
            appendTo: '.' + resourceId + '_',
            delay: 100,
            containment: 'parent',
            cursor: 'crosshair',
            //handle: '.sort_icon',
            stop: function() {
                $('div.nested', this).each(function(i,v) {
                    var nodeId = getIdFromClassString($(v).attr('class'));
                    if (!nodeId) return;
                    var url = rootUrl + nodeId + '/' + 'in';
                    $.ajax({
                        url: url,
                        dataType: 'json',
                        contentType: 'application/json; charset=utf-8',
                        async: false,
                        headers: headers,
                        success: function(data) {
                            if (!data || data.length == 0 || !data.result) return;
                            //                        var rel = data.result;
                            //var pos = rel[parentId];
                            var nodeUrl = rootUrl + nodeId;
                            setPosition(resourceId, nodeUrl, i)
                        }
                    });
                    _Resources.reloadPreviews();
                });
            }
        });
    },


    addNode : function(button, type, entity, resourceId) {
        if (isDisabled(button)) return;
        disable(button);
        var pos = $('.' + resourceId + '_ .' + entity.id + '_ > div.nested').length;
        //    console.log('addNode(' + type + ', ' + entity.id + ', ' + entity.id + ', ' + pos + ')');
        var url = rootUrl + type;
        var resp = $.ajax({
            url: url,
            //async: false,
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json; charset=utf-8',
            headers: headers,
            data: '{ "type" : "' + type + '", "name" : "' + type + '_' + Math.floor(Math.random() * (9999 - 1)) + '", "elements" : "' + entity.id + '" }',
            success: function(data) {
                var getUrl = resp.getResponseHeader('Location');
                $.ajax({
                    url: getUrl + '/all',
                    success: function(data) {
                        var node = data.result;
                        if (entity) {
                            _Resources.appendElement(node, entity, resourceId);
                            _Resources.setPosition(resourceId, getUrl, pos);
                        }
                        //disable($('.' + groupId + '_ .delete_icon')[0]);
                        enable(button);
                    }
                });
            }
        });
    },

    reloadPreviews : function() {
        $('iframe', $('#previews')).each(function() {
            this.contentDocument.location.reload(true);
        });
    },
    
    zoomPreviews : function(value) {
        $('.preview_box', previews).each(function() {
            var val = value/100;
            var box = $(this);

            //            self.css('-moz-transform',    'scale(' + val + ')');
            //            self.css('-o-transform',      'scale(' + val + ')');
            //            self.css('-webkit-transform', 'scale(' + val + ')');

            box.css('-moz-transform',    'scale(' + val + ')');
            box.css('-o-transform',      'scale(' + val + ')');
            box.css('-webkit-transform', 'scale(' + val + ')');

            var w = origWidth * val;
            var h = origHeight * val;

            box.width(w);
            box.height(h);

            $('iframe', box).width(w);
            $('iframe', box).height(h);

            console.log("box,w,h", box, w, h);

        });

    },

	
    linkSelectionToResource : function(rootResourceId, sourceId, linkedResourceId, startOffset, endOffset) {
        console.log('linkResourcesToSelection(' + rootResourceId + ', ' + sourceId + ', ' + linkedResourceId + ', ' + startOffset + ', ' + endOffset + ')');
        var data = '{ "command" : "LINK" , "id" : "' + sourceId + '" , "data" : { "rootResourceId" : "' + rootResourceId + '", "resourceId" : "' + linkedResourceId + '", "startOffset" : ' + startOffset + ', "endOffset" : ' + endOffset + '} }';
        return send(data);
    }

};