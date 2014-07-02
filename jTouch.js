( function(container) {

		var children = new Array();

		var direction = 0;
		//左右 =1  上下 = 2

		var slideW;

		var windowType;

		var getChildes = function() {

			var cn = container.children();

			for (var i = 0; i < cn.length; i++) {
				children[i] = cn[i];
				$(cn[i]).css("position", "relative");
			};

			slideW = $(children[0]).width();

			console.log("getChildren", children);
		}();

		var setEvents = function() {
			/*
			 *
			 	var x = event.pageX - $(this).offset().left;
				var y = event.pageY - $(this).offset().top;
				windowType = event.type;
				eventsHandle(1, [x, y]);

			 */
			var evnets;
			var eventTypesM = ["mousedown","mousemove","mouseup"];
			var eventTypesT = ["touchstart","touchmove","touchend"];

			return {
				ifBaneWindow:false,
				
				onAndOff : function() {
					
					console.log(direction,this.ifBaneWindow);
					if (direction == 1 && !this.ifBaneWindow) {

						window["on" + windowType] = function(e) {
							e.preventDefault();
							e.stopPropagation();
						};
						this.ifBaneWindow = true;
						return "bane window";
					}
					if (direction == 2 && this.ifBaneWindow) {
						window["on" + windowType] = function() { };
						
						this.ifBaneWindow = false;
						return "save window";
					};
					return "nothing";
				}
			};
		}();

		var eventsHandle = function() {

			var preX;
			var preY;
			var ifStart = false;
			var rejectTouchMove = false;

			var down = function(c) {
				preX = c[0];
				preY = c[1];
				ifStart = true;
			};
			var move = function(c) {
				if (ifStart) {
					var x = c[0];
					var y = c[1];
					
					console.log(x - preX,y - preY);
					
					if (Math.abs(x - preX) >= Math.abs(y - preY)) {
						//左右
						direction = 1;
						$("#s").text("水平");

					} else {
						//上下
						direction = 2;
						$("#s").text("垂直");

					}
					
					$("#cx").text(x-preX);
					$("#cy").text(y-preY);
					
					var oor = setEvents.onAndOff();
	
					console.info(oor);
				}
				
			};
			var up = function(c) {
				ifStart = false;
				
			};

			var actions = [down, move, up];

			return function(i, coords) {

				if (i >= 0 && i <= 2) {

					actions[i](coords);

					return true;
				} else {
					return false;
				}
			};
		}();

	}($("#boxes")));
