( function(container) {

		children = new Array();

		var direction = 0;
		//左右 =1  上下 = 2

		var childW;

		var windowType;

		var getChildes = function() {

			var cn = $(container).children();
			childW = $(container).width() / cn.length;
			for (var i = 0; i < cn.length; i++) {
				children[i] = cn[i];
				$(cn[i]).css("position", "relative").width(childW);
			};
			$("#cw").text(childW + "px");
		}();

		var setEvents = function() {

			var evnets;
			var ifDevice = false;
			var eventTypesM = ["mousedown", "mousemove", "mouseup"];
			var eventTypesT = ["touchstart", "touchmove", "touchend"];

			if ("createTouch" in document) {
				events = eventTypesT;
				ifDevice = true;
			} else {
				events = eventTypesM;
				ifDevice = false;
			}
			for (var i = 0; i < events.length; i++) {
				( function(i) {
					if (i == 2) {
						window["on" + events[i]] = function(e) {
							eventsHandle(-1, [0, 0]);
						};
					}
					container["on" + events[i]] = function(e) {
	
						var eventO = ifDevice ? e.touches[0] : e;
						var x = eventO.pageX - $(this).offset().left;
						var y = eventO.pageY - $(this).offset().top;

						if (i == 1) {
							windowType = eventO.type;
						}
						eventsHandle(i, [x, y]);
					};
				}(i));
			};

			return {
				ifBaneWindow : false,

				onAndOff : function() {

					if (direction == 1 && !this.ifBaneWindow) {

						window["on" + windowType] = function(e) {
							e.preventDefault();
							e.stopPropagation();
						};
						this.ifBaneWindow = true;

						return "bane window";
					}
					if (direction == 2 && this.ifBaneWindow) {
						window["on" + windowType] = function() {
						};

						this.ifBaneWindow = false;

						return "save window";
					};
					return "nothing";
				}
			};
		}();

		var eventsHandle = function() {

			var preLeft;
			var preX;
			var preY;

			var ifDown = false;
			var moveFn = undefined;
			var ifGone = false;

			var down = function(c) {

				var currentLeft = $(children[0]).css("left");
				if (currentLeft == "auto") {
					preLeft = 0;
				} else {
					preLeft = Number(currentLeft.substring(0, currentLeft.length - 2));
				}
				preX = c[0];
				preY = c[1];

				ifDown = true;

			};
			var move = function(c) {
				if (ifDown) {
					var x = c[0];
					var y = c[1];

					if (!direction) {
						if (Math.abs(x - preX) >= Math.abs(y - preY)) {
							//左右
							direction = 1;
							$("#s").text("水平");
						} else {
							//上下
							direction = 2;
							$("#s").text("垂直");
						}
						moveFn = movehandle(direction);
					} else {
						moveFn.call(moveFn, c);
					}

					$("#cx").text(x - preX);
					$("#cy").text(y - preY);

					var oor = setEvents.onAndOff();
				}
			};
			var movehandle = function(d) {

				if (d == 1 || d == 2) {

					var vertHandler = function(c) {

						var w = c[0] - preX;
						
						for (var i = 0; i < children.length; i++) {
							$(children[i]).css("left", preLeft + w + "px");
						};
					};
					var horiHandler = function(c) {

					};

					var handles = [vertHandler, horiHandler];

					return handles[d - 1];
				} else {
					throw ("not a correct direction in movehandle");
				}
			};
			var up = function(c) {

				var w = c[0] - preX;
				
				if (Math.abs(w) > childW * 0.2 && !(preLeft >= 0 && w > 0)) {

					moveFn = function() {
					};
			
					var i = w > 0 ? 1 : -1;
					var p = slide(i, preLeft);
			
					p.done(function() {
						var currentLeft = $(children[0]).css("left");

						if (currentLeft == "auto") {
							preLeft = 0;
						} else {
							preLeft = Number(currentLeft.substring(0, currentLeft.length - 2));
						}
						direction = 0;
					});
				}				
			};
			var windowUp = function(){
				
				ifDown = false;
				direction = 0;

				for (var i = 0; i < children.length; i++) {
					$(children[i]).css("left", preLeft + "px");
				};
			};
			var actions = [down, move, up];

			return function(i, coords) {
				if (i >= 0 && i <= 2) {
					actions[i](coords);
					return true;
				} else if(i==-1){
					windowUp();
					return true;
				}else{
					
					return false;
				}
			};
		}();
		//滑动的动画过程
		var slide = function(d, pl) {
			// d=1 or d=-1;
			var dfd = new $.Deferred();
			//currentDisplacement  currentLeft addupLeft
			var cdp = childW * d;
			var cl = pl;
			var al = cl;

			var speed = 45;
			var count = 2;
			var rate = Math.pow(2, 6);

			function go() {
				if (count == rate) {
					for (var i = 0; i < children.length; i++) {
						$(children[i]).css("left", (cl + cdp) + "px");
					};
					$("#cl").text((cl + cdp) + "px");
					dfd.resolve();
				} else {

					al = cdp / count + al;

					for (var i = 0; i < children.length; i++) {
						$(children[i]).css("left", al + "px");
					};
					count = count * 2;
					setTimeout(go, speed);
				}
			};
			setTimeout(go, speed);

			return dfd.promise();
		};
	}($("#boxes")[0]));
