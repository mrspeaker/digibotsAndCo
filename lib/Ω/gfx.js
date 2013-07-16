(function (Ω) {

	"use strict";

	var images = {};

	var gfx = {

		init: function (ctx) {

			this.ctx = ctx;
			this.canvas = ctx.canvas;

			this.w = this.canvas.width;
			this.h = this.canvas.height;

		},

		loadImage: function (path, cb) {

			var cachedImage = images[path];

			if (cachedImage) {
				if (!cachedImage._loaded) {
					cachedImage.addEventListener("load", function() {
						cb && cb(cachedImage);
					}, false);
					cachedImage.addEventListener("error", function() {
						console.log("error loading image");
						cb && cb(cachedImage);
					}, false);
				} else {
					cb && cb(cachedImage);
				}
				return;
			}

			var resolve = Ω.preload(path),
				image = new Image(),
				onload = function () {

					this._loaded = true;
					cb && cb(image);
					resolve();

				}

			image._loaded = false;
			image.src = path;
			image.addEventListener("load", onload, false);
			image.addEventListener("error", function() {

				console.error("Error loading image", path);
				onload.call(this);

			}, false);
			images[path] = image;

		},

		drawImage: function (img, x, y) {

			this.ctx.drawImage(
				img,
				x,
				y);
		},

		createCanvas: function (w, h) {
			var cn = document.createElement("canvas");
			cn.setAttribute("width", w);
			cn.setAttribute("height", h);
			return cn.getContext("2d");
		},


		loadShaders: function(ctx, vsid, fsid) {
		    var parse = function(shader) {
		            var code = "",
		                current = shader.firstChild;
		            while(current) {
		                if(current.nodeType == current.TEXT_NODE)
		                    code += current.textContent;
		                current = current.nextSibling;
		            }
		            return code;
		        },
		        fShaderEl = document.getElementById(fsid),
		        vShaderEl = document.getElementById(vsid),
		        fShader, vShader, shaderProgram,
		        c = ctx;
		    if(!fShaderEl || !vShaderEl) {
		        alert("Error, Could Not Find Shaders");
		        return;
		    }

		    //Load and Compile Fragment Shader
		    fShader = c.createShader(c.FRAGMENT_SHADER);
		    c.shaderSource(fShader, parse(fShaderEl));
		    c.compileShader(fShader);

		    //Load and Compile Vertex Shader
		    vShader = c.createShader(c.VERTEX_SHADER);
		    c.shaderSource(vShader, parse(vShaderEl));
		    c.compileShader(vShader);

		    //Create The Shader Program
		    shaderProgram = c.createProgram();
		    c.attachShader(shaderProgram, fShader);
		    c.attachShader(shaderProgram, vShader);
		    c.linkProgram(shaderProgram);
		    c.useProgram(shaderProgram);

		    return shaderProgram;
		},
		text: {

			drawShadowed: function (msg, x, y, shadow, font) {

				var c = gfx.ctx;

				shadow = shadow || 2;
				if (font) {
					c.font = font;
				}
				c.fillStyle = "#000";
				c.fillText(msg, x + shadow, y + shadow);
				c.fillStyle = "#fff";
				c.fillText(msg, x, y);

			},


			getWidth: function (msg) {

				return gfx.ctx.measureText(msg).width;

			},

			getHalfWidth: function (msg) {

				return this.getWidth(msg) / 2;

			},

			getHeight: function (msg) {

				return gfx.ctx.measureText(msg).height;

			},

			getHalfHeight: function (msg) {

				return this.getHeight(msg) / 2;

			}

		}

	};

	Ω.gfx = gfx;

}(Ω));
