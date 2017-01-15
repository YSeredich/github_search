/**
 * Created by yulia on 09.01.2017.
 */
const form = document.getElementById('searchForm');
const button = document.getElementById('searchControl');
const input = document.getElementById('searchText');
const userInfoContainer = document.getElementById('userInfo');
const userReposContainer = document.getElementById('userRepos');

const renderer = new Renderer(userInfoContainer, userReposContainer);
const onSubmit = (e) => {
    e.preventDefault();
    if (input.value.length) {
        GithubApiClient.getUser(input.value).then(
            user => renderer.setUser(new User(user)),
            error => renderer.setError(error.message)
        );
    }
};

form.addEventListener('submit', onSubmit);




