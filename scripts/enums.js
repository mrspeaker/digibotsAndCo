(function () {

	var dirs = {
		"UP": 0,
		"DOWN": 1,
		"LEFT": 2,
		"RIGHT": 3,
		swap: function (dir) {
			var op;
			switch (dir) {
				case dirs.UP: op = dirs.DOWN; break;
				case dirs.DOWN: op = dirs.UP; break;
				case dirs.LEFT: op = dirs.RIGHT; break;
				case dirs.RIGHT: op = dirs.LEFT; break;
			}
			return op;
		}
	};

	window.dirs = dirs;

}());
