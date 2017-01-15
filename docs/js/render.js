/**
 * Created by yulia on 14.01.2017.
 */

class Renderer {

    constructor(infoContainer, reposContainer, currentPage = 0, pageSize = 10) {
        this._currentPage = currentPage;
        this._pageSize = pageSize;
        this._infoContainer = infoContainer;
        this._reposContainer = reposContainer;
        this._sort = {};
        this._currentSort = null;
        this._user = null;
        this._setSortCallback();
    }

    setUser(user) {
        this._user = user;
        this._drawUser();
        this._drawRepos();
    }

    setError(message) {
        this._infoContainer.innerHTML = message;
    }

    _drawUser() {
        this._infoContainer.innerHTML = Renderer._createUserMarkup(this._user.info);
    }

    _drawRepos() {
        Renderer._clearHandlers(this._reposContainer);
        this._reposContainer.innerHTML = '';

        let fragment = document.createDocumentFragment();
        fragment.appendChild(this._createPaginationElement());
        fragment.appendChild(this._createSortElement());
        this._drawReposPage(fragment);

    }

    _drawReposPage(fragment) {
        this._user.repos.then(
            repos => {
                if (this._currentSort) {
                    repos.sort(this._sort[this._currentSort]);
                }
                let from = this._currentPage * this._pageSize;
                let to = from + this._pageSize;
                const currentPage = repos.slice(from, to);
                currentPage.forEach((repo) => {
                    fragment.appendChild(Renderer._createRepoElement(repo));
                });
                this._reposContainer.appendChild(fragment);
            }
        );
    }

    static _createUserMarkup(user) {
        return `<h1>${user.name ? user.name : 'Anonym'}</h1>
        <div><a href="${user.html_url}">${user.login}</a> on github</div>
        <div>location: ${user.location ? user.location : 'unknown'}</div>
        <div>company: ${user.company ? user.company : 'unknown'}</div>
        <div>email: ${user.email ? user.email : 'unknown'}</div>
        <div>followers count: ${user.followers}</div>
        <h2>Public repositories: ${user.public_repos}</h2>`;
    };

    static _createRepoMarkup(repo) {
        return `<div class="user__repo">
        <h3><a href="${repo.html_url}">${repo.name}</a></h3>
        <p>${repo.description ? repo.description : ''}</p>
        <div>language: ${repo.language ? repo.language : '-'}</div>
        <div>size: ${repo.size}</div>
        <div>forks: ${repo.forks_count}</div>
        <div>watchers: ${repo.watchers_count}</div>
        <div>contributors: ${repo.contributors.length ? repo.contributors.length + ' <a href="#" class="showContributors">show</a>' : repo.contributors.length} </div>
        <div class="repoContributors invisible">${Renderer._createContributorsMarkup(repo.contributors)}</div>
        </div>`;
    };

    static _createContributorsMarkup(contributors) {
        let users = contributors.map((contributor) => {
            return `<a href="${contributor.html_url}">${contributor.login}</a>`;
        });
        return users.join(', ');
    }

    static _createPaginationMarkup(pagesCount) {
            let paginationItem = ['<a href="#" data-page="prev" class="pagination-item">previous</a>'];
            for (let i = 0; i < pagesCount; i++) {
                paginationItem.push(`<a href="#" class="pagination-item" data-page="${i}">${i + 1}</a>`);
            }
            paginationItem.push(' <a href="#" class="pagination-item" data-page="next">next</a>');
            return paginationItem.join(' ');
    }

    static _createSortingMarkup() {
        return `<div>Sort by:
        <a href="#" data-sort="contributors">contributors</a>
        <a href="#" data-sort="watchers">watchers</a>
        <a href="#" data-sort="forks">forks</a>
        <a href="#" data-sort="size">size</a>
        </div>`;
    }

    static _createRepoElement(repo) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = Renderer._createRepoMarkup(repo);
        const control = wrapper.querySelector('.showContributors');
        if (control) {
            control.addEventListener('click', Renderer._showContributors);
        }
        return wrapper;
    }

    _createPaginationElement() {
        let pagination = document.createElement('div');
        if (this._user.info.public_repos > this._pageSize) {
            pagination.innerHTML = Renderer._createPaginationMarkup(this._user.info.public_repos / this._pageSize);
            let controls = pagination.querySelectorAll('.pagination-item');
            for (let i = 0; i < controls.length; i++) {
                controls[i].addEventListener('click', this._onPaginationClick.bind(this));
            }
        }
        return pagination;
    }

    _createSortElement() {
        let sorting = document.createElement('div');
        sorting.innerHTML = Renderer._createSortingMarkup();
        let controls = sorting.querySelectorAll('a');
        for (let i = 0; i < controls.length; i++) {
            controls[i].addEventListener('click', this._onSortingClick.bind(this));
        }
        return sorting;
    }

    static _showContributors(e) {
        e.preventDefault();
        const parent = e.target.closest('.user__repo');
        const contributors = parent.querySelector('.repoContributors');
        if (contributors.classList.contains('invisible')) {
            contributors.classList.remove('invisible');
            e.target.innerHTML = 'hide';
        } else {
            contributors.classList.add('invisible');
            e.target.innerHTML = 'show';
        }
    }

    _onPaginationClick(e) {
        e.preventDefault();
        const paginationValue = e.target.dataset.page;
        if (paginationValue == 'prev') {
            if (this._currentPage > 0) {
                this._currentPage--;
                this._drawRepos();
            }
        } else if (paginationValue == 'next') {
            if (this._currentPage < this._user.info.public_repos / this._pageSize - 1) {
                this._currentPage++;
                this._drawRepos();
            }
        } else {
            this._currentPage = +paginationValue;
            this._drawRepos();
        }
    }

    _setSortCallback() {
        this._sort.contributors = (a, b) => {
            return b.contributors.length - a.contributors.length;
        };
        this._sort.watchers = (a, b) => {
            return b.watchers_count - a.watchers_count;
        };
        this._sort.forks = (a, b) => {
            return b.forks_count - a.forks_count;
        };
        this._sort.size = (a, b) => {
            return b.size - a.size;
        };
    }

    _onSortingClick(e) {
        e.preventDefault();
        this._currentPage = 0;
        this._currentSort = e.target.dataset.sort;
        this._drawRepos();
    }

    static _clearHandlers(container) {
        const controls = container.querySelectorAll('.showContributors');
        for (let i = 0; i < controls.length; i++) {
            controls[i].removeEventListener('click', Renderer._showContributors);
        }
    }
}