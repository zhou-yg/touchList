$(document).ready( function(_global) {
	
	var u = new function(){
		
		this.getSpeed = function(_speed) {

			var speedMod = ["fast", "normal", "slow"];
			var speeds = [1000, 1750, 2500];

			if ( typeof _speed == "string") {
				var s = speeds[speedMod.indexOf(_speed)];
				return s;
			} else if ( typeof _speed == "number") {
				return _speed;
			} else {
				throw new Error("argument's type of speed is invalid");
			}
		};
		this.getLeft = function(_obj) {

			var currentLeft = $(_obj).css("left");

			if (currentLeft == "auto") {
				return 0;
			} else {
				return Number(currentLeft.substring(0, currentLeft.length - 2));
			}
		};
		//滑动的动画过程
		//obj：滑动的对象，cw:单位滑动的距离,d：左还是右的方向,pl：总体已经的left,ml：当前拖动时，释放时的left
		this.slide = function(_obj,_cw,_d, _pl, _ml) {
			// d=1 or d=-1;
			var dfd = new $.Deferred();
			//currentDisplacement  需要滑动的距离
			//currentLeft  元起点
			//addupLeft    已经滑动的距离
			var cdp = (_cw - _ml ) * _d;
			var al = _pl + _ml * _d;

			var speed = 45;
			var c = 2;
			var rate = Math.pow(c, 6);
			
			$(_obj).animate({
				left:((_pl + _cw * _d) + "px")
			},400,function(){
				dfd.resolve();
			});

			return dfd.promise();
		};
		this.stMedium = {
			s:false,
			t:true,
			//锁定幻灯片
			lock:function(){
				if(!this.s && this.t){
					//如果幻灯片开始了，禁止拖动
					t.op.ban();
					ls.start();
					this.s = true;
					this.t = false;
				}
			},
			//解锁幻灯片
			unlock:function(){
				if(this.s && !this.t){
					//如果开始脱了，禁止幻灯片
					ls.cancel();
					t.op.pick();
					this.s = false;
					this.t = true;
				}
			},
			update:function(_lc){
				ls.updateLC(_lc);
				t.updateLc(_lc);
			}
		};
	};
	var ls = new function(){

		var lanternMod;

		var obj;
		var maxLength;
		var childWidth;
		var leftCounts;
		var speed;

   	    //滑动方向  :左 -1，右+1
		var directionLR;
		var preLeft;
		
		//以当前位置开始幻灯片
		this.start = function(_obj,_ml,_cw,_lc,_s,_dlr){
			
			obj = _obj;
			maxLength = _ml;
			childWidth = _cw;
			leftCounts = _lc;
			speed = _s;
			
			directionLR = 1;
			
			speed = u.getSpeed(speed);
			
			if (speed && speed>=1000) {
				setLanterSlide(speed);
			}
		};
		
		this.cancel = function(){
			clearTimeout(lanternMod);
		};
		
		lanternSlide = function(_ls,_dlr) {

			var dfd = new $.Deferred();
				
			if (leftCounts == 1 || leftCounts == maxLength) {
				_dlr = (_dlr > 0) ? -1 : 1;
				console.log("x");
			}
			
			if(!preLeft){
				preLeft = u.getLeft(obj);
			}
				
			var p = u.slide(obj,childWidth,_dlr, preLeft, 0);
			
			preLeft = preLeft + childWidth * _dlr;
			leftCounts = leftCounts + -1 * _dlr;
			
			p.done(function() {
				leftCounts = leftCounts + -1 * _dlr;

				dfd.resolve(_dlr);
			});
			
			return dfd.promise();
		};
		
		setLanterSlide = function(_s) {

			function task(_dlr){
				
				var p = lanternSlide(_s,_dlr);
				
				if(p){
					
					p.done(function(_dlr){
						lanternMod = setTimeout(task,_s,_dlr);
					});
				}
			}
			
			lanternMod = setTimeout(task,_s,directionLR);
		};
	};
	
	var t = new function() {

		var parContainer;
		var container;
		var containerId;

		var children = new Array();
		//左边的滚动数，最高 children.length
		var leftCounts = 1;
		var childWidth;

		//左右 =1  上下 = 2
		var direction = 0;
		//左 -1 右+1
		var directionLR = 0;

		var preLeft;

		var setEventers;
		var eventsHandler;
		
		this.init = function(_o, _lanternSpeed) {

			if ( typeof _o == "string") {
				if (_o[0] != "#") {
					_o = "#" + _o;
				}
			}
			container = $(_o)[0];
			parContainer = $(_o).parent()[0];

			children = $(container).children();

			//子节点的宽度
			childWidth = function() {

				var protypes = ["margin", "padding"];
				var positones = ["-left" + "-right"];

				var w = $(children[0]).width();

				protypes.forEach(function(_p1) {
					positones.forEach(function(_p2) {
						var p = $(children[0]).css(_p1 + _p2);
						if (p) {
							w = w + Number(p.substring(0, p.length - 2));
						}
					});
				});
				return w;
			}();

			$(container).css("position", "relative");

			var imgEls = $("#" + container.id + " img");
			for (var i = 0; i < imgEls.length; i++) {
				imgEls[i].draggable = false;
			};
			
			eventsHandler = eventsHandle();
			setEventers = setEvents();
			
			this.op = {
				ban:eventsHandler.ban,
				pick:eventsHandler.pick,
			};
			
			ls.start(container,children.length,childWidth,leftCounts,_lanternSpeed);
		};

		function setEvents() {

			var evnets;
			var ifDevice = false;
			var eventTypesM = ["mousedown", "mousemove", "mouseup"];
			var eventTypesT = ["touchstart", "touchmove", "touchend", "touchcancel"];

			if ("createTouch" in document) {
				events = eventTypesT;
				ifDevice = true;
			} else {
				events = eventTypesM;
				ifDevice = false;
			}
			for (var i = 0; i < events.length; i++) {( function(_i) {
				
						if (_i == 2) {
							window["on" + events[_i]] = function() {
								eventsHandler.handle(_i, [0, 0]);
							};
							if (events[_i + 1]) {
								window["on" + events[_i]] = function() {
									eventsHandler.handle(_i, [0, 0]);
								};
							}
						} else {
							parContainer["on" + events[_i]] = function(_e) {

								var eventO = ifDevice ? _e.touches[0] : _e;
								var x = eventO.pageX - $(this).offset().left;
								var y = eventO.pageY - $(this).offset().top;

								eventsHandler.handle(_i, [x, y]);
							};
						}
					}(i));
			};
		};

		function eventsHandle() {

			var preX;
			var preY;

			//当前，正在拖动时，已经往左的拖动路程
			var moveLeft;

			var ifDown = false;
			var moveFn = undefined;
			var ifGone = false;

			var ifslide = false;

			var windowEventObj = {
				
				ifbanWindow : false,

				onAndOff : function() {

					if (direction == 1 && !this.ifbanWindow) {

						window["ontouchmove"] = function(_e) {
							_e.preventDefault();
							_e.stopPropagation();
						};
						
						this.ifbanWindow = true;
					}
					if (direction == 2 && this.ifbanWindow) {
						
						window["ontouchmove"] = function() {
						};

						this.ifbanWindow = false;
					};
				}
			};

			var down = function(_c) {

				if (!ifDown && !ifslide) {

					preX = _c[0];
					preY = _c[1];

					ifDown = true;
				}
			};
			var move = function(_c) {

				if (ifDown && !ifslide) {

					var x = _c[0];
					var y = _c[1];
					
					if (!direction) {
						if (Math.abs(x - preX) >= Math.abs(y - preY)) {
							direction = 1;
						} else {
							direction = 2;
						}
						moveFn = movehandle(direction);
					} else {
						moveFn(_c);
					}

					var oor = windowEventObj.onAndOff();
				}
			};
			var movehandle = function(_d) {

				if (_d == 1 || _d == 2) {

					var vertHandler = function(_c) {

						var w = _c[0] - preX;

						if (Math.abs(w) > childWidth * 0.15) {
							directionLR = (w >= 0 ? 1 : -1);
						} else {
							directionLR = 0;
						}

						moveLeft = Math.abs(w);

						$(container).css("left", preLeft + w + "px");
					};
					var horiHandler = function(_c) {

					};

					var handles = [vertHandler, horiHandler];

					return handles[_d - 1];
				} else {
					throw ("not a correct direction in movehandle");
				}
			};
			var up = function(_c) {

				if (!ifslide) {

					if (!(directionLR > 0 && leftCounts == 1) && directionLR && direction && !(leftCounts >= children.length && directionLR < 0)) {

						ifslide = true;

						var p = u.slide(container,childWidth,directionLR, preLeft, moveLeft);

						p.done(function() {

							if (directionLR > 0) {
								leftCounts--;
							} else {
								leftCounts++;
							}
							
							preLeft = u.getLeft(container);

							ifDown = false;
							direction = 0;
							directionLR = 0;
							ifslide = false;
							
							u.stMedium.update(leftCounts);
							u.stMedium.lock();

					} else {

						$(container).css("left", preLeft + "px");

						ifDown = false;
						direction = 0;
						directionLR = 0;

						u.stMedium.lock();
					}
				}
			};
			var actions = [down, move, up];

			return {
				ban : function() {
					
					ifDown = true;
					direction = 1;
					directionLR = 0;
					ifslide = true;
				},
				pick : function() {

					ifDown = false;
					direction = 0;
					directionLR = 0;
					ifslide = false;
				},
				handle : function(_i, _coords) {
					
					if (_i >= 0 && _i <= 2) {
						actions[_i](_coords);
						return true;
					} else {
						return false;
					}
				}
			};
		};
	};
	
	_global.mTouch = t;
}(window));