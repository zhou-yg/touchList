$(document).ready( function() {
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
		this.banDrag = function(_obj){
			//IE及Chrome下,阻止页面双击选中文本
			$(_obj)[0].onselectstart = function(_e){
				_e.preventDefault();
				return false;
			};
			
			var objC = $(_obj).children();
			
			if(objC.length == 0){
				return;
			}

			ban(objC);

			function ban(_o){

				for (var i=0; i <_o.length; i++) {
					
					if(_o[i].nodeName="IMG"){
				  		_o[i].draggable = false;
					}
					if($(_o[i]).children().length != 0 ){
						ban($(_o[i]).children());
				  	}
				};
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
		this.slide = function(_obj,_cw,_d, _pl) {
			// d=1 or d=-1;
			var dfd = new $.Deferred();
			//currentLeft  元起点
			//addupLeft    已经滑动的距离

			var speed = 45;
			
			$(_obj).animate({
				left:((_cw * _d + _pl) + "px")
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
					this.s = false;
					this.t = true;
				}
			},
			update:function(_lc){
				ls.update(_lc);
				t.update(_lc);
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
		this.init = function(_obj,_ml,_cw,_lc,_s,_dlr){
			
			obj = _obj;
			maxLength = _ml;
			childWidth = _cw;
			leftCounts = _lc;
			speed = _s;
			
			directionLR = 1;
			
			speed = u.getSpeed(speed);
		};
		this.start = function(){
			if (speed && speed>=1000) {
				setLanterSlide(speed);
			}
		};
		this.cancel = function(){
			clearTimeout(lanternMod);
		};
		this.update = function(_lc){
			leftCounts = _lc;
		};
		
		lanternSlide = function(_ls,_dlr) {

			var dfd = new $.Deferred();
				
			if (leftCounts == 1 || leftCounts == maxLength) {
				_dlr = (_dlr > 0) ? -1 : 1;
			}
			
			if(!preLeft){
				preLeft = u.getLeft(obj);
			}
				
			var p = u.slide(obj,childWidth,_dlr, preLeft);
			
			preLeft = preLeft + childWidth * _dlr;
			leftCounts = leftCounts + -1 * _dlr;
			
			p.done(function() {
				
				u.stMedium.update(leftCounts);

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
		//左 -1 右+1,默认向右
		var directionLR = 1;

		var preLeft = 0;

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

			/*
			var imgEls = $("#" + container.id + " img");
			for (var i = 0; i < imgEls.length; i++) {
				imgEls[i].draggable = false;
			};
			*/
			u.banDrag(container);
			
			setEventers = setEvents();
			eventsHandler = eventsHandle();
			
			//ls.init(container,children.length,childWidth,leftCounts,_lanternSpeed);
			//u.stMedium.lock();
		};
		
		this.update = function(_lc){
			leftCounts = _lc;
		};
		function display(){
			$("#state").text(arguments[0]);
			$("#leftCounts").text(arguments[1]);
			$("#childWidth").text(arguments[2]);
			$("#direction").text(arguments[3]);
			$("#directionLR").text(arguments[4]);
			$("#preX").text(arguments[5]);
			$("#preLeft").text(arguments[6]);
			$("#isDown").text(arguments[7]);
			$("#isSlide").text(arguments[8]);
		}
		function setEvents() {

			var evnets;
			var isDevice = false;
			var eventTypesM = ["mousedown", "mousemove", "mouseup"];
			var eventTypesT = ["touchstart", "touchmove", "touchend"];

			var offSetLeft = $(container).offset().left;
			var offSetTop  = $(container).offset().top;

			if ("createTouch" in document) {
				events = eventTypesT;
				isDevice = true;
			} else {
				events = eventTypesM;
				isDevice = false;
			}
			for (var i = 0; i < events.length; i++) {( function(_i) {
				
						if (_i == 2) {
							window["on" + events[_i]] = function() {
			
								eventsHandler.handle(_i, [0, 0]);
							};
						} else {
							parContainer["on" + events[_i]] = function(_e) {
								
								var eventO = isDevice ? _e.touches[0] : _e;
								var x = eventO.pageX - offSetLeft;
								var y = eventO.pageY - offSetTop;
								
								eventsHandler.handle(_i, [x, y]);
							};
						}
					}(i));
			};
			$("#error").text("ready");
		};
		//如果用户的动作传进来了，那么就做响应处理
		function eventsHandle() {

			var preX;
			var preY;

			//当前，正在拖动时，已经往左的拖动路程
			var moveLeft;

			var isDown = false;
			var moveFn = undefined;

			var isSlide = false;

			var windowEventObj = {
				
				isbanWindow : false,

				onAndOff : function() {

					if (direction == 1 && !this.isbanWindow) {
						
						window.ontouchmove = function(_e) {
							_e.preventDefault();
							_e.stopPropagation();
						};
						
						this.isbanWindow = true;
					}
					if (direction == 2 && this.isbanWindow) {
							
						window.ontouchmove = function() {
						};

						this.isbanWindow = false;
					};
				}
			};
			var key = function(_t){
				
				var r = false;
				
				switch(_t){
				
					case "down": r = !isDown && !isSlide;break;
				
					case "move":r = isDown && !isSlide;break;
				
					case "up":r = !isSlide;break;
				}
				
				return r;
			};
			var down = function(_c) {
				
				//u.stMedium.unlock();
				
				display("down",leftCounts,childWidth,direction,directionLR,preX,preLeft,isDown,isSlide);

				if (key("down")) {

					preX = _c[0];
					preY = _c[1];

					preLeft = u.getLeft(container);

					isDown = true;
				}
			};
			var move = function(_c) {

				display("move",leftCounts,childWidth,direction,directionLR,preX,preLeft,isDown,isSlide);

				if (key("move")) {

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

						$("#error").text(_c[0]+"="+_c[1]+"="+preX);
				
						var w = _c[0] - preX;
						
						//$("#error").text(w+"px");

						directionLR = (w >= 0 ? 1 : -1);
		
						moveLeft = Math.abs(w);

						$(container).css("left", preLeft + w + "px");
					};
					var horiHandler = function(_c) {
					};

					var handles = [vertHandler, horiHandler];

					return handles[_d - 1];
				} else {
					$("#error").text("moveFn throw");
					throw new Error("not a correct direction in movehandle");
				}
			};
			var up = function(_c) {


				if (key("up")) {

					if (!(directionLR > 0 && leftCounts == 1) && direction && !(leftCounts >= children.length && directionLR < 0)) {

						isSlide = true;

						var p = u.slide(container,childWidth,directionLR, preLeft);

						p.done(function() {

							if (directionLR > 0) {
								leftCounts--;
							} else {
								leftCounts++;
							}
							
							preLeft = u.getLeft(container);

							isDown = false;
							direction = 0;
							isSlide = false;
							
							display("up",leftCounts,childWidth,direction,directionLR,preX,preLeft,isDown,isSlide);
							//u.stMedium.update(leftCounts);
							//u.stMedium.lock();
						});

					} else {
						
						isSlide = true;
						
						var p = u.slide(container,0,-directionLR,preLeft);
						
						p.done(function(){
							
							isDown = false;
							direction = 0;
							isSlide = false;

							display("up",leftCounts,childWidth,direction,directionLR,preX,preLeft,isDown,isSlide);
						});
						//u.stMedium.lock();
					}
				}
				
			};
			var actions = [down, move, up];

			return {
				
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
	window.mTouch = t;
});