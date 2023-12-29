// MODEL - business logic, can include STATE (stores DATA) and HTTP LIBRARY (responsible for AJAX requests)

// import { async } from 'regenerator-runtime';
import { API_URL, RES_PER_PAGE, API_KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        page: 1,
        resultsperPage: RES_PER_PAGE,
    },
    bookmarks: [],
};

const createRecipeObject = function (data) {
    const { recipe } = data.data;
    return {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image_url,
        sourceUrl: recipe.source_url,
        cookingTime: recipe.cooking_time,
        ingredients: recipe.ingredients,
        servings: recipe.servings,
        publisher: recipe.publisher,
        ...(recipe.key && { key: recipe.key }),
    };
}

export const loadRecipe = async function (id) {
    try {
        const data = await AJAX(`${API_URL}/${id}?key=${API_KEY}`);

        state.recipe = createRecipeObject(data);

        if (state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true;
        else state.recipe.bookmarked = false;

    } catch (error) {
        // throw error since catch it on controllers
        console.error(`${error} 💥💥💥`);
        throw error;
    }
};

export const uploadRecipe = async function (newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe)
            .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
            .map(ingredient => {
                const ingArray = ingredient[1].split(',').map(el => el.trim());
                // const ingArray = ingredient[1].replaceAll(' ', '').split(',');
                if (ingArray.length !== 3) throw new Error('Wrong format!');
                const [quantity, unit, description] = ingArray;
                return { quantity: quantity ? +quantity : null, unit, description }
            });

        const recipe = {
            title: newRecipe.title,
            image_url: newRecipe.image,
            source_url: newRecipe.sourceUrl,
            cooking_time: +newRecipe.cookingTime,
            ingredients,
            servings: +newRecipe.servings,
            publisher: newRecipe.publisher,
        }

        const data = await AJAX(`${API_URL}?key=${API_KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
    } catch (error) {
        throw error;
    }
};


export const loadSearchResults = async function (query) {
    try {
        state.search.query = query;
        const data = await AJAX(`${API_URL}?search=${query}&key=${API_KEY}`);
        const { recipes } = data.data;
        state.search.results = recipes.map(recipe => {
            return {
                id: recipe.id,
                title: recipe.title,
                image: recipe.image_url,
                publisher: recipe.publisher,
                ...(recipe.key && { key: recipe.key }),
            };
        });

        state.search.page = 1;
    } catch (error) {
        // throw error since catch it on controllers
        console.error(`${error} 💥💥💥`);
        throw error;
    }
};

export const getSearchResultsPage = function (page = state.search.page) {
    state.search.page = page;

    const start = (page - 1) * state.search.resultsperPage;// 0;
    const end = page * state.search.resultsperPage; // 9;

    return state.search.results.slice(start, end); // slice(0,10)
};

export const updateServings = function (newServings) {
    state.recipe.ingredients.forEach(ingredient => {
        ingredient.quantity = (ingredient.quantity * newServings) / state.recipe.servings;
        // newQt = oldQt * newServings / oldServings // 2 * 8 / 4 = 4
    });
    state.recipe.servings = newServings;
};

const persistBookmarks = function () {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks))
}

export const addBookmark = function (recipe) {
    // Add Bookmark
    state.bookmarks.push(recipe);
    // Mark current recipe as bookmarked
    if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
    persistBookmarks();
}

export const deleteBookmark = function (id) {
    // delete Bookmark
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);
    console.log(index);
    // Mark current recipe as NOT bookmarked
    if (id === state.recipe.id) state.recipe.bookmarked = false;
    persistBookmarks();
}

const init = function () {
    const storage = localStorage.getItem('bookmarks');
    if (storage) state.bookmarks = JSON.parse(storage);
}

init();

const clearBookmarks = function () {
    localStorage.removeItem('bookmarks');
}

// clearBookmarks();
