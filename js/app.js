window.onload = function() {




	// Actually create our 'TrianglesJs' instance.
	function createTriangles() {
		this.canvas = document.getElementById('triangleExample');
		this.triWidth = 300; // width of tri cell
		this.triHeight = 225; // height of tri cell
		this.variance = 40; // variance to randomize cell points

		// setup paper global instance with this canvas
		// We're not using paperscript, so its properties are not global.
		// need to access them paper.*
		paper.setup(this.canvas);

		this.points = [];
		this.paths = [];
		this.coordinates = [];
		this.colors = [];
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
			const scale = chroma.scale(['2B2249', '3D213E']);
			// return the amount of colors based on tris being shown
			this.colors = scale.colors(this.coordinates.length);
		}

		this.render = function render() {
			// generate our points from canvas width/height & variance
			this.generatePoints();
			this.generateTriangleCoordinates();
			this.generateColorScale();

			// Stolen from Paper.js Voronoi example
			// http://paperjs.org/examples/voronoi/
			paper.project.activeLayer.children = [];

			// based on generateTriangleCoordinates renders the triangles in paper.js
			for (var i = 0; i < this.coordinates.length; i += 1) {
				console.log('color?? '+this.colors[i]);
				var triPath = new paper.Path({
					segments: this.coordinates[i],
					fillColor: this.colors[i],
					closed: true,
					strokeWidth: 0,
				});
			}


		}
	}

	window.triangles = new createTriangles();

	console.group('Triangles created!');
	console.log(triangles);
	console.groupEnd();

	triangles.render();
}
