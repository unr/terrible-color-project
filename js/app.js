window.onload = function() {
	console.group('are we ready?');
	console.log(Delaunator);
	console.log(paper);
	console.groupEnd();

	function createTriangles() {
		this.canvas = document.getElementById('triangleExample');
		this.variance = 20;

		// setup paper global instance with this canvas
		// We're not using paperscript, so its properties are not global.
		// need to access them paper.*
		paper.setup(this.canvas);

		this.points = [];
		this.paths = [];
		this.coordinates = [];
		this.delaunay = null;

		// Generate a grid of points, based on canvas height/width && variance offset
		// if touching the edge (0, maxHeight/width) do not apply variance
		// Otherwise, apply random amount of variance?
		this.generatePoints = function generatePoints() {
			this.points = [
				// OG Points example...
				// [0, 0], [200, 0], [400, 0], [600, 0],
				// [0, 250], [200, 250], [400, 250], [600, 250],
				// [0, 500], [200, 500], [400, 500], [600, 500],
				// Points with "Variance" example
				[0, 0], [200, 0], [400, 0], [600, 0],
				[0, 260], [220, 240], [430, 280], [600, 220],
				[0, 500], [190, 500], [390, 500], [600, 500],
			];
		}

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

		this.render = function render() {
			// generate our points from canvas width/height & variance
			this.generatePoints();

			this.generateTriangleCoordinates();

			// Stolen from Paper.js Voronoi example
			// http://paperjs.org/examples/voronoi/
			paper.project.activeLayer.children = [];

			// based on generateTriangleCoordinates renders the triangles in paper.js
			for (var i = 0; i < this.coordinates.length; i += 1) {
				console.log(this.coordinates[i]);
				var triPath = new paper.Path({
					segments: this.coordinates[i],
					fillColor: 'black',
					closed: true,
					selected: true,
				});
			}


		}
	}

	window.triangles = new createTriangles();

	console.group('Triangles created!');
	console.log(triangles);
	console.groupEnd();
}
