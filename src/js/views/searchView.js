class SearchView {
    _parentElement = document.querySelector('.search');

    getQuery() {
        const query = this._parentElement.querySelector('.search__field').value;
        if (!query) return;
        console.log(`Query is ${query}`);
        this._clearInput();
        return query;
    }

    _clearInput() {
        this._parentElement.querySelector('.search__field').value = '';
    }

    addHandlerRender(handler) {
        this._parentElement.addEventListener('submit', function (event) {
            event.preventDefault();
            handler();
        });
    }
}

export default new SearchView();
