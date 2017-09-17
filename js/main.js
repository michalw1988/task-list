// Mappings
const difficultyTextMapping = {
	1: 'easy',
	2: 'medium',
	3: 'hard'
};

const difficultyColorMapping = {
	1: 'badge-success',
	2: 'badge-warning',
	3: 'badge-danger'
};

const deadlineTextMapping = {
	1: 'today',
	2: 'this week',
	3: 'this month',
	4: 'long term'
};


// Global variables
let rememberedTaskId;
let sortType = 'deadline ASC';
let filterDifficultyType = '';
let filterDeadlineType = '';
//let apiBaseUrl = 'http://localhost:3000';
let apiBaseUrl = 'https://tasklistapi.herokuapp.com';


// Loading tasks for the first time (default sorting and filtering)
fetchTasks();



// ***** API calls *****

// Loading tasks with sorting and filtering set by user
function fetchTasks() {
	fetch(apiBaseUrl + '/gettasks/', {
		method: 'post',
		headers: {
	    'Content-Type': 'application/json'
	  },
		body: JSON.stringify({
			sortType: sortType,
			filterDifficultyType: filterDifficultyType,
			filterDeadlineType: filterDeadlineType
		})
	})
	.then(res => res.json())
	.then(data => {
		let tasksHTML = '';
		if (data.length === 0) {
			tasksHTML += `
				<div class="text-center mt-1 mb-3">
				  You don't have any task planned. Enjoy your free time!
				</div>
			`;
		} else {
			data.forEach(task => {
				tasksHTML += renderSingleTask(task);
			});
		}
		document.getElementById('resultDiv').innerHTML = tasksHTML;
	})
	.catch(err => console.log(err));
}


// Adding new task
function addTask() {
	var difficultyDropdown = document.getElementById('addDifficultyDropdown');
	var deadlineDropdown = document.getElementById('addDeadlineDropdown');
	fetch(apiBaseUrl + '/addtask/', {
		method: 'post',
		headers: {
	    'Content-Type': 'application/json'
	  },
		body: JSON.stringify({
			description: document.getElementById('newTaskDescription').value,
			difficulty: difficultyDropdown[difficultyDropdown.selectedIndex].value,
			deadline: deadlineDropdown[deadlineDropdown.selectedIndex].value
		})
	})
	.then(res => res.text())
	.then(data => {
		fetchTasks();
	})
	.catch(err => console.log(err));
}


// Updating existing task
function updateTask() {
	var difficultyDropdown = document.getElementById('editDifficultyDropdown');
	var deadlineDropdown = document.getElementById('editDeadlineDropdown');
	fetch(apiBaseUrl + '/updatetask/', {
		method: 'post',
		headers: {
	    'Content-Type': 'application/json'
	  },
		body: JSON.stringify({
			id: rememberedTaskId,
			newDescription: document.getElementById('editModalInput').value,
			newDifficulty: difficultyDropdown[difficultyDropdown.selectedIndex].value,
			newDeadline: deadlineDropdown[deadlineDropdown.selectedIndex].value
		})
	})
	.then(res => res.text())
	.then(data => {
		fetchTasks();
	})
	.catch(err => console.log(err));
}


// Marking task as completed
function completeTask(e) {
	fetch(apiBaseUrl + '/completetask/' + e.dataset.id)
	.then(res => res.text())
	.then(data => {
		fetchTasks();
	})
	.catch(err => console.log(err));
}


// Marking task as not completed
function undoTask(e) {
	fetch(apiBaseUrl + '/undotask/' + e.dataset.id)
	.then(res => res.text())
	.then(data => {
		fetchTasks();
	})
	.catch(err => console.log(err));
}


// Removing task
function removeTask() {
	fetch(apiBaseUrl + '/deletetask/' + rememberedTaskId)
	.then(res => res.text())
	.then(data => {
		fetchTasks();
	})
	.catch(err => console.log(err));
}



// ***** Event listeners *****

// Event listener for "Add new task" button
document.getElementById('addNewTaskButton').addEventListener('click', () => {
	addTask();
	document.getElementById('newTaskDescription').value = '';
	document.getElementById('addDifficultyDropdown').selectedIndex = 0;
	document.getElementById('addDeadlineDropdown').selectedIndex = 0;
});


// Event listener for sort options
const sortButtons = document.querySelectorAll('.sort-button');
sortButtons.forEach(button => button.addEventListener('click', e => {
	sortButtons.forEach(button => button.classList.remove('active'));
	e.target.classList.add('active');
	sortType = e.target.dataset.sortType;
	fetchTasks();
}));


// Event listener for difficulty filter options
const filterDifficultyButtons = document.querySelectorAll('.filter-difficulty-button');
filterDifficultyButtons.forEach(button => button.addEventListener('click', e => {
	filterDifficultyButtons.forEach(button => button.classList.remove('active'));
	e.target.classList.add('active');
	filterDifficultyType = e.target.dataset.filterDifficultyType;
	fetchTasks();
}));


// Event listener for deadline filter options
const filterDeadlineButtons = document.querySelectorAll('.filter-deadline-button');
filterDeadlineButtons.forEach(button => button.addEventListener('click', e => {
	filterDeadlineButtons.forEach(button => button.classList.remove('active'));
	e.target.classList.add('active');
	filterDeadlineType = e.target.dataset.filterDeadlineType;
	fetchTasks();
}));



// ***** Helpers *****

// Preparing HTML for a single task item (based on json object returned from the API)
function renderSingleTask(task) {
	let completionButton = (task.done === 0) ? `<button class="btn btn-warning btn-sm" data-id="${task.id}" onclick="completeTask(this)">Not Completed</button>` : `<button class="btn btn-success btn-sm" data-id="${task.id}" onclick="undoTask(this)">Completed</button>`;
	let taskHTML = `
		<div class="card mb-2">
		  <div class="card-body p-2">
		  	<span class="align-middle">
		  		<span class="col-1 badge ${difficultyColorMapping[task.difficulty]}">${difficultyTextMapping[task.difficulty]}</span> 
		  		<span class="col-1 badge badge-dark">${deadlineTextMapping[task.deadline]}</span> 
		  		${(task.done === 0) ? task.description : '<s>' + task.description + '</s>'}
		  	</span>
	      <span class="float-right">
	        ${completionButton}
	        <button class="btn btn-info btn-sm" data-toggle="modal" data-target="#editModal" data-id="${task.id}" data-description="${task.description}" data-difficulty="${task.difficulty}" data-deadline="${task.deadline}" onclick="rememberTaskData(this)">Edit</button>
	        <button class="btn btn-danger btn-sm" data-toggle="modal" data-target="#removeModal" data-id="${task.id}" onclick="rememberTaskId(this)">Remove</button>
		 		</span>
		  </div>
		</div>
	`;
	return taskHTML;
}


// remembering task id (for deleting modal)
function rememberTaskId(e) {
	rememberedTaskId = e.dataset.id;
}


// remembering task id and filling modal fields with values (for editing modal)
function rememberTaskData(e) {
	rememberedTaskId = e.dataset.id;
	document.getElementById('editModalInput').value = e.dataset.description;
	document.getElementById('editDifficultyDropdown').value = e.dataset.difficulty;
	document.getElementById('editDeadlineDropdown').value = e.dataset.deadline;
}