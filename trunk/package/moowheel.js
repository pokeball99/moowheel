/*
   MooWheel Class
   version 0.2beta
   Copyright (c) 2008 unwieldy studios
   This library is licensed under an MIT-style license.
*/

var MooWheel = new Class({
   options: {
      type: 'default',
      json: {
         url: '',
         method: 'get',
         send: {}
      },
      center: {
         x: 100,
         y: 100
      },
      lines: {
         color: 'random',
         lineWidth: 2
      },
      radialMultiplier: 3.47,
      hover: true,
      hoverLines: {
         color: 'rgba(255,255,255,255)',
         lineWidth: 3
      }
   },
   
   initialize: function(data, canvas, options) {
      this.canvas = $(canvas);
      this.cx = canvas.getContext('2d');
      this.maxCount = 1;
      
      var canvasPos = this.canvas.getCoordinates();
      
      this.options.center = {x: canvasPos.width / 2, y: canvasPos.height / 2};
      this.setOptions(options);

      if(data != false) {
         this.data = data;
      } else {
         var WheelReq = new Json.Remote(this.options.json.url, {
            onComplete: function(wheelData) {
               this.data = wheelData;
               
               this.data.each(function(item) {
                  item.each(function(subitem) {
                     if($type(subitem) == 'array' && subitem[1] > this.maxCount)
                        this.maxCount = subitem[1];
                  }, this);
               }, this);
               
               this.draw();
            }.bind(this),
            method: this.options.json.method
         }).send(this.options.json.send);
      }
      
      CanvasTextFunctions.enable(this.cx);
            
      if(this.options.hover) {
         this.hoverCanvas = new Element('canvas', {
            'styles': {
               position: 'absolute',
               left: canvasPos.left + 'px',
               top: canvasPos.top + 'px',
               zIndex: 9
            },
            
            width: canvasPos.width + 'px',
            height: canvasPos.height + 'px'
         });
         
         this.hoverCanvas.attributes.width.nodeValue = this.hoverCanvas.attributes.width.nodeValue.replace(/px/, '');
         this.hoverCanvas.attributes.height.nodeValue = this.hoverCanvas.attributes.height.nodeValue.replace(/px/, '');
         
         this.hoverCanvas.injectAfter(this.canvas);

         window.addEvent('resize', function() {
            var canvasPos = this.canvas.getCoordinates();
            
            this.hoverCanvas.setStyles({left: canvasPos.left + 'px', top: canvasPos.top + 'px'});
            this.hoverCanvas.width = canvasPos.width;
            this.hoverCanvas.height = canvasPos.height;
         }.bind(this));
  
         if(typeof(G_vmlCanvasManager) != 'undefined') {
             this.hoverCanvas = $(G_vmlCanvasManager.initElement(this.hoverCanvas));
         }
      }
      
      if(this.options.json.url.length == 0) {
         this.data.each(function(item) {
            item.each(function(subitem) {
               if($type(subitem) == 'array' && subitem[1] > this.maxCount)
                  this.maxCount = subitem[1];
            }, this);
         }, this);
         
         this.draw();
      }
   },
   
   setData: function(data) {
      this.data = data;
   },
   
   setPoints: function() {
      this.nameLookup = {};   // setup a lookup table by data name
      this.points = {};
      
      this.radius = Math.round(this.options.radialMultiplier * this.data.length);
      this.numDegrees = (360 / this.data.length);
      
      for(var i = 0, j = 0; i < 360; i += this.numDegrees, j++) {
         var color = {};
         
         // choose a color for the item
         switch(this.options.type) {
            case 'heat':
               for(var q=0; q<this.data[j].length; q++) {
                  color[$type(this.data[j][q]) == 'array' ? this.data[j][q][0] : this.data[j][q]] = ($type(this.data[j][q]) == 'array' ? this.getTemperature('heat', this.data[j][q][1] / this.maxCount) : this.getTemperature('heat', 1 / this.maxCount));
               }
               
               color['__default'] = (this.options.lines.color == 'random' ? "rgba(" + (Math.floor(Math.random() * 195) + 60) + "," + (Math.floor(Math.random() * 195) + 60) + "," + (Math.floor(Math.random() * 195) + 60) + ", 1)" :
                                                                            this.options.lines.color);
            break;
                        
            case 'cold':
               for(var q=0; q<this.data[j].length; q++) {
                  color[$type(this.data[j][q]) == 'array' ? this.data[j][q][0] : this.data[j][q]] = ($type(this.data[j][q]) == 'array' ? this.getTemperature('cold', (this.maxCount - this.data[j][q][1]) / (this.maxCount - 1 <= 0 ? 1 : this.maxCount - 1)) : this.getTemperature('cold', 1));
               }
               
               color['__default'] = (this.options.lines.color == 'random' ? "rgba(" + (Math.floor(Math.random() * 195) + 60) + "," + (Math.floor(Math.random() * 195) + 60) + "," + (Math.floor(Math.random() * 195) + 60) + ", 1)" :
                                                                            this.options.lines.color);
            break;
            
            case 'default':
               if(this.options.lines.color == 'random')
                  color['__default'] = "rgba(" + (Math.floor(Math.random() * 195) + 60) + "," + (Math.floor(Math.random() * 195) + 60) + "," + (Math.floor(Math.random() * 195) + 60) + ", 1)";
               else
                  color['__default'] = this.options.lines.color;
            break;
         }

         // lookup table
         this.nameLookup[this.data[j][0]] = [i, color];
      }
   },
   
   drawPoints: function() {
      for(var i = 0, j = 0; i < 360; i += this.numDegrees, j++) {
         //try {
            this.cx.beginPath();
            this.cx.fillStyle = this.cx.strokeStyle = this.nameLookup[this.data[j][0]][1]['__default'];
            
            // solve for the dot location on the large circle
            var x = this.options.center.x + Math.cos(i * (Math.PI / 180)) * this.radius;
            var y = this.options.center.y + Math.sin(i * (Math.PI / 180)) * this.radius;
                                 
            // draw the colored dot
            this.cx.arc(x, y, 4, 0, Math.PI * 2, 0);
            this.cx.fill();
            this.cx.closePath();
            
            if(!this.points[Math.round(x/7) * 7])
               this.points[Math.round(x/7) * 7] = {};
               
            this.points[Math.round(x/7) * 7][Math.round(y/7) * 7] = j;

            // draw the text
            this.cx.save();
            this.cx.translate(this.options.center.x, this.options.center.y);
            this.cx.rotate((i > 90 && i < 270 ? i-180 : i) * (Math.PI / 180));
            this.cx.drawText('sans', '10', (i>90&&i<270?-(this.radius + this.cx.measureText('sans', '10', this.data[j][0]+'') + 8):(this.radius + 8)), (this.cx.fontAscent('sans','10') / 2), this.data[j][0] + '');
            this.cx.restore();
         //} catch(e) { }
      }
   },
   
   drawConnection: function(i, hover) {
      var cx = hover ? this.hoverCanvas.getContext('2d') : this.cx;
      var connections = this.data[i].slice(1);
      var nameArr = this.nameLookup[this.data[i][0]];
      var angle = nameArr[0];
      
      // solve for the line starting point location on the large circle
      var x = this.options.center.x + Math.cos(angle * (Math.PI / 180)) * this.radius;
      var y = this.options.center.y + Math.sin(angle * (Math.PI / 180)) * this.radius;
      
      cx.lineWidth = hover ? this.options.hoverLines.lineWidth : 2;
      
      // draw the bezier curve
      // note: the control points of the curve are the radius / 2
      for(var j = 0; j < connections.length; j++) {
         cx.strokeStyle = hover ? (nameArr[1][connections[j][0]] ? nameArr[1][connections[j][0]] : nameArr[1]['__default']).replace(/, \d\.?\d+?\)/, ',1)') :
                                  (nameArr[1][connections[j][0]] ? nameArr[1][connections[j][0]] : nameArr[1]['__default']);
         cx.beginPath();
         cx.moveTo(x, y);
         rpos = this.nameLookup[$type(connections[j]) == 'array' ? connections[j][0] : connections[j]][0];
         x2 = this.options.center.x + Math.cos(rpos * (Math.PI / 180)) * this.radius;
         y2 = this.options.center.y + Math.sin(rpos * (Math.PI / 180)) * this.radius;
         cp1x = this.options.center.x + Math.cos(angle * (Math.PI / 180)) * (this.radius / 1.5);
         cp1y = this.options.center.y + Math.sin(angle * (Math.PI / 180)) * (this.radius / 1.5)
         cp2x = this.options.center.x + Math.cos(rpos * (Math.PI / 180)) * (this.radius / 1.5);
         cp2y = this.options.center.y + Math.sin(rpos * (Math.PI / 180)) * (this.radius / 1.5);
         cx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x2, y2);
         cx.stroke();
         cx.closePath();
      }
      
      if(hover) return;
      
      if(this.data[i+1]) {
         var self = this;
         setTimeout(function() { self.drawConnection(i+1); }, 25);
      } else {
         this.drawPoints();
      }
   },
   
   draw: function() {
      if(this.data) {
         this.setPoints();
         this.drawConnection(0);
      }

      if(this.options.hover) {
         $(this.hoverCanvas).addEvent('mousemove', function(e) {
            e = new Event(e);
            
            var pos = $(this.hoverCanvas).getCoordinates();
            
            var pageScroll = {x: (document.all ? document.body.scrollLeft : window.pageXOffset),
                              y: (document.all ? document.body.scrollTop : window.pageYOffset)};
            
            var mpos = {x: Math.round(((e.client.x + pageScroll.x) - pos.left) / 7) * 7,
                        y: Math.round(((e.client.y + pageScroll.y) - pos.top) / 7) * 7};

            if($defined(this.points[mpos.x]) && $defined(this.points[mpos.x][mpos.y])) {
               if(this.lastMouseOver == this.points[mpos.x][mpos.y])
                  return;
                   
               this.drawConnection(this.points[mpos.x][mpos.y], true);
               
               this.lastMouseOver = this.points[mpos.x][mpos.y];
               
               this.canvas.setStyle('opacity', '0.5');
            } else if($defined(this.lastMouseOver)) {
               var cx = this.hoverCanvas.getContext('2d');
               cx.clearRect(0, 0, pos.width, pos.height);
               cx.save();
   
               this.lastMouseOver = null;
               
               this.canvas.setStyle('opacity', '1.0');            
            }
         }.bind(this));
      }
   },
   
   getTemperature: function(type, percent) {
      if(type == 'heat') {
         var p = {r: percent / 0.33, y: (percent - 0.33) / 0.33, w: (percent - 0.66) / 0.66};
   
         var r = Math.round(p.r * 255 > 255 ? 255 : p.r * 255);
         var y = Math.round(p.y * 255 > 255 ? 255 : p.y * 255);
         var w = Math.round(p.w * 255 > 255 ? 255 : p.w * 255);
         
         return 'rgba(' + (r < 0 ? 0 : r) + ',' + (y < 0 ? 0 : y) + ',' + (w < 0 ? 0 : w) + ', ' + (percent * 0.8 + 0.2) + ')';
      } else if(type == 'cold') {         
         var r = Math.round(percent * 255);
         var g = Math.round(130 + (percent * 125));
         
         return 'rgba(' + r + ',' + g + ',255, ' + (percent * 0.8 + 0.2) + ')';
      }
   }
});
MooWheel.implement(new Options);