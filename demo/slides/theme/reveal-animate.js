class ApiElement {
	constructor(selector) {
		this.elt = document.querySelectorAll(selector);
		this.actions = [];
	}
	push(action) {
		this.actions.push(elt => {
			action(elt);
			return Promise.resolve();
		});
		return this;
	}
	hide() {
		return this.push(elt => {
			elt.style.visibility = 'hidden';
		});
	}
	show() {
		return this.push(elt => {
			elt.style.visibility = 'visible';
		});
	}
	waitForNext() {
		this.actions.push(() => {
			return new Promise(resolve => {
				const SPACE = 32;
				const onkeydown = e => {
					//if (event.keyCode === SPACE) {
					e.stopPropagation();
					e.preventDefault();

					Reveal.removeEventListener('slidechanged', onkeydown);
					resolve();
					//}
				};
				Reveal.addEventListener('slidechanged', onkeydown);
			});
		});
		return this;
	}
	waitFor(time) {
		this.actions.push(() => {
			return new Promise(resolve => {
				setTimeout(() => {
					resolve();
				}, time);
			});
		});
		return this;
	}
	async run() {
		function chainPromises(actions, f) {
			return actions.reduce((acc, action) => {
				return acc.then(() => f(action));
			}, Promise.resolve());
		}
		await chainPromises(this.actions, action =>
			Promise.all(Array.from(this.elt).map(elt => action(elt)))
		);
	}
}
const RevealAnimate = {
	get(selector) {
		return new ApiElement(selector);
	},
};
window.addEventListener('DOMContentLoaded', () => {
	function evalScript(currentSlide) {
		const scriptElement = currentSlide.querySelector("script[type='text/animations']");
		if (scriptElement) {
			eval(scriptElement.innerHTML);
		}
	}

	evalScript(Reveal.getCurrentSlide());

	Reveal.addEventListener('slidechanged', function(event) {
		evalScript(event.currentSlide);
	});
});
