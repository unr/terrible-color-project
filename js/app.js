window.onload = function() {




	// Actually create our 'TrianglesJs' instance.
	function createTriangles() {
		this.canvas = document.getElementById('triangleExample');
		this.triWidth = 270; // width of tri cell
		this.triHeight = 315; // height of tri cell
		this.variance = 90; // variance to randomize cell points

		// setup paper global instance with this canvas
		// We're not using paperscript, so its properties are not global.
		// need to access them paper.*
		paper.setup(this.canvas);

		this.points = [];
		this.paths = [];
		this.coordinates = [];
		this.colors = [];
		this.trianglesGroup = null;
		this.overlayGroup = null;
		this.delaunay = null;

		// Generate a grid of points, based on canvas height/width && variance offset
		// if touching the edge (0, maxHeight/width) do not apply variance
		// Otherwise, apply random amount of variance?
		this.generatePoints = function generatePoints() {
			const width = this.canvas.offsetWidth;
			const height = this.canvas.offsetHeight;

			// determine how many tri's we need to iterate over, to fill the canvas
			const rows = Math.ceil(height / this.triHeight);
			const cols = Math.ceil(width / this.triWidth);

			// reset points
			this.points = [];

			// loop over rows
			for (var row = 0; row <= rows; row += 1) {
				var point = [0, 0];

				// each row needs each column
				for (var col = 0; col <= cols; col += 1) {
					var x = col * this.triWidth;
					var y = row * this.triHeight;

					// If point is considered 'within the canvas', apply variance
					if (x > this.variance && x < (width - this.variance)) x += this.randomVariance();
					if (y > this.variance && y < (height - this.variance)) y += this.randomVariance();

					this.points.push([x, y]);
				}
			}
		}

		// Randomly gets positive/negative amount of variance
		// up to the maximum specified variance
		this.randomVariance = function randomVariance() {
			var max = 0 + this.variance;
			var min = 0 - this.variance;
			return Math.floor(Math.random() * (max - min + 1)) + min;
		}

		// Based on existing points array, generate Delaunator of points for tri coordinates
		this.generateTriangleCoordinates = function generateTriangleCoordinates() {
			// set our delaunay instance for tris
			const delaunay = new Delaunator(this.points);

			// Get the delaunay coordinates in a loop
			// delaunay.triangles are the references to points...
			this.coordinates = [];
			for (var i = 0; i < delaunay.triangles.length; i += 3) {
				this.coordinates.push([
					this.points[delaunay.triangles[i]],
					this.points[delaunay.triangles[i + 1]],
					this.points[delaunay.triangles[i + 2]]
				]);
			}
		}

		// TODO make this chroma scale thing... a property? include it yourself? not sure yet...
		this.generateColorScale = function generateColorScale() {
			const scale = chroma.scale(['391E44', '6F5975']);
			// return the amount of colors based on tris being shown
			this.colors = scale.colors(this.coordinates.length);
		}

		this.generateOverlay = function generateOverlay() {
			var rect = new paper.Path.Rectangle({
				from: [0, 0],
				to: [this.canvas.offsetWidth, this.canvas.offsetHeight],
				blendMode: 'overlay',
				fillColor: {
					gradient: {
						stops: ['#2E1749', '#D32E4C'],
					},
					origin: [0, 0],
					destination: [this.canvas.offsetWidth, this.canvas.offsetHeight],
				},

				// blend modes
				// 'normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard- light', 'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation', 'luminosity', 'color', 'add', 'subtract', 'average', 'pin-light', 'negation', 'source- over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'darker', 'copy', 'xor'
			});

			this.overlayGroup = new paper.Group([rect]);
		}

		this.generateShine = function generateShine() {
			var shine = new paper.Path.Circle({
				center: paper.project.view.center,
				radius: 450,
				blendMode: 'overlay',
			});
			/**
			shine.fillColor = {
				gradient: {
					stops: [
						[new paper.Color(255, 255, 255, 0.4), 0.05],
						[new paper.Color(255, 255, 255, 0.3), 0.25],
						[new paper.Color(255, 255, 255, 0.2), 0.4],
						[new paper.Color(255, 255, 255, 0), 0.85]],
					radial: true,
				},
				origin: shine.position,
				destination: shine.bounds.rightCenter,
			};
			*/

			this.shineGroup = new paper.Group([shine]);

			paper.project.view.onMouseMove = function(event) {
				shine.position = event.point;

				const hoveredItems = this.trianglesGroup.hitTestAll(event.point, {
					fill: true,
					stroke: true,
					segments: true,
					class: paper.Path,
					tolerance: 2,
				});
				console.log(hoveredItems);

				hoveredItems.forEach(function (hoveredItem) {
					hoveredItem.item.fillColor = 'red';
				});
			}.bind(this);
		}

		this.generateTriangles = function generateTriangles() {
			const tris = [];

			// based on generateTriangleCoordinates renders the triangles in paper.js
			for (var i = 0; i < this.coordinates.length; i += 1) {
				const triColor = new paper.Color(this.colors[i]);
				const triColorTwo = triColor.clone().brightness = triColor.brightness - 0.05;
				const tri = new paper.Path({
					segments: this.coordinates[i],
					closed: true,
					strokeWidth: 1,
					strokeColor: this.colors[i],
				});

				tri.fillColor = {
					stops: [
						[triColor, 0.6],
						[triColorTwo, 0.9],
					],
					origin: tri.bounds.topCenter,
					destination: tri.bounds.bottomRight,
				};

				tris.push(tri);
			}

			this.trianglesGroup = new paper.Group(tris);
		}

		this.render = function render() {
			// Stolen from Paper.js Voronoi example
			// http://paperjs.org/examples/voronoi/
			paper.project.activeLayer.children = [];

			// generate our points from canvas width/height & variance
			this.generatePoints();
			this.generateTriangleCoordinates();
			this.generateColorScale();
			this.generateTriangles();
			this.generateOverlay();
			this.generateShine();
		}
	}

	window.triangles = new createTriangles();

	console.group('Triangles created!');
	console.log(triangles);
	console.groupEnd();

	triangles.render();
}
