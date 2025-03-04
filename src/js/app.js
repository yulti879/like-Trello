class Board {
	constructor(container) {
		this.container = container;
		this.columns = ['Нужно сделать', 'В процессе', 'Сделано'];
		this.init();
	}

	init() {
		this.columns.forEach((column, index) => {
			const columnElement = this.createColumn(column, index);
			this.container.appendChild(columnElement);
		});
	}

	createColumn(title, index) {
		const column = document.createElement('div');
		column.className = 'column';
		column.innerHTML = `
        <h2>${title}</h2>
        <div class="cards" data-column="${index}"></div>
        <button class="add-card-btn">Добавить новую карточку</button>
        <form class="add-card-form">
          <textarea placeholder="Запишите задачу сюда"></textarea>
          <div class="form-controls">
            <button type="submit">Добавить</button>
            <button type="button" class="cancel-btn">×</button>
          </div>
        </form>
      `;

		const addCardBtn = column.querySelector('.add-card-btn');
		const addCardForm = column.querySelector('.add-card-form');
		const textarea = addCardForm.querySelector('textarea');
		const cancelBtn = column.querySelector('.cancel-btn');

		addCardBtn.addEventListener('click', () => {
			addCardForm.style.display = 'block';
			addCardBtn.style.display = 'none';
		});

		cancelBtn.addEventListener('click', () => {
			addCardForm.style.display = 'none';
			addCardBtn.style.display = 'block';
			textarea.value = '';
		});

		addCardForm.addEventListener('submit', (e) => {
			e.preventDefault();
			const cardText = textarea.value.trim();
			if (cardText) {
				this.addCard(cardText, index);
				textarea.value = '';
			}
			addCardForm.style.display = 'none';
			addCardBtn.style.display = 'block';
		});

		return column;
	}

	addCard(text, columnIndex) {
		const card = document.createElement('div');
		card.className = 'card';
		card.draggable = true;
		card.innerHTML = `
        <div class="card-content">${text}</div>
        <button class="delete-card">×</button>
      `;

		const deleteBtn = card.querySelector('.delete-card');
		deleteBtn.addEventListener('click', () => {
			card.remove();
			this.saveState();
		});

		card.addEventListener('dragstart', (e) => {
			e.dataTransfer.setData('text/plain', JSON.stringify({
				sourceColumn: columnIndex,
				cardHtml: card.outerHTML
			}));
			card.classList.add('dragging');
		});

		card.addEventListener('dragend', () => {
			card.classList.remove('dragging');
		});

		const cardsContainer = this.container.querySelector(`.cards[data-column="${columnIndex}"]`);
		cardsContainer.appendChild(card);
		this.saveState();
	}

	saveState() {
		const state = this.columns.map((_, index) => {
			const cards = Array.from(this.container.querySelectorAll(`.cards[data-column="${index}"] .card`));
			return cards.map(card => card.querySelector('.card-content').textContent.trim());
		});
		localStorage.setItem('boardState', JSON.stringify(state));
	}

	loadState() {
		const state = JSON.parse(localStorage.getItem('boardState'));
		if (state) {
			state.forEach((cards, index) => {
				cards.forEach(cardText => this.addCard(cardText, index));
			});
		}
	}
}

document.addEventListener('DOMContentLoaded', () => {
	const boardContainer = document.querySelector('.board');
	const board = new Board(boardContainer);
	board.loadState();

	let placeholder = document.createElement('div');
	placeholder.className = 'placeholder';

	boardContainer.addEventListener('dragstart', (e) => {
		const card = e.target.closest('.card');
		if (!card) return;

		placeholder.style.height = `${card.offsetHeight}px`;
		card.classList.add('dragging');
		e.dataTransfer.setData('text/plain', JSON.stringify({
			sourceColumn: [...boardContainer.children].indexOf(card.closest('.column')),
			cardHtml: card.outerHTML
		}));
	});

	boardContainer.addEventListener('dragover', (e) => {
		e.preventDefault();
		const card = document.querySelector('.dragging');
		if (!card) return;

		const targetColumn = e.target.closest('.column');
		if (!targetColumn) return;

		const cardsContainer = targetColumn.querySelector('.cards');
		const afterElement = getDragAfterElement(cardsContainer, e.clientY);

		if (afterElement) {
			afterElement.before(placeholder);
		} else {
			cardsContainer.appendChild(placeholder);
		}
	});

	boardContainer.addEventListener('drop', (e) => {
		e.preventDefault();
		const draggingCard = document.querySelector('.dragging');
		if (!draggingCard) return;

		draggingCard.remove();
		const data = JSON.parse(e.dataTransfer.getData('text/plain'));
		const newCard = document.createElement('div');
		newCard.innerHTML = data.cardHtml;
		const cardElement = newCard.firstElementChild;
		cardElement.className = 'card';
		cardElement.draggable = true;

		placeholder.replaceWith(cardElement);

		cardElement.querySelector('.delete-card').addEventListener('click', () => {
			cardElement.remove();
			board.saveState();
		});

		cardElement.addEventListener('dragstart', (e) => {
			e.dataTransfer.setData('text/plain', JSON.stringify({
				sourceColumn: [...boardContainer.children].indexOf(cardElement.closest('.column')),
				cardHtml: cardElement.outerHTML
			}));
			cardElement.classList.add('dragging');
		});

		board.saveState();
		cardElement.classList.remove('dragging');
	});

	function getDragAfterElement(container, y) {
		if (!container) return null;
		const draggableElements = [...container.querySelectorAll('.card:not(.dragging)')];

		return draggableElements.reduce((closest, child) => {
			const box = child.getBoundingClientRect();
			const offset = y - box.top - box.height / 2;

			if (offset < 0 && offset > closest.offset) {
				return {
					offset,
					element: child
				};
			}
			return closest;
		}, {
			offset: Number.NEGATIVE_INFINITY
		}).element;
	}
});

// comment this to pass build
const unusedVariable = "variable";

// for demonstration purpose only
export default function demo(value) {
	return `Demo: ${value}`;
}

console.log("app.js included");