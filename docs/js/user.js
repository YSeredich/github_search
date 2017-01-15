/**
 * Created by yulia on 15.01.2017.
 */
class User {
    constructor(user) {
        this.info = user;
        this.repos = User._getRepos(user.login);
    }

    static _getRepos(login) {
        return GithubApiClient.getUserRepos(login).then(
            repos => Promise.all(
                repos.map((repo) => User._addContributors(repo, login))
            )
        );
    }

    static _addContributors(repo, login) {
        return GithubApiClient.getRepoContributors(login, repo.name).then(
            contributors => {
                repo.contributors = contributors;
                return repo;
            }
        );
    }

}