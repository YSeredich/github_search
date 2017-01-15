/**
 * Created by yulia on 09.01.2017.
 */

class GithubApiClient {

    static getResponse(url) {
        return new Promise(
            (resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url);
                xhr.onload = (event) => {
                    if (event.target.status == 200) {
                        resolve(JSON.parse(event.target.response));
                    } else if (event.target.status == 204){
                        resolve([]);
                    } else {
                        var error = new Error(event.target.statusText);
                        error.code = event.target.status;
                        reject(error);
                    }
                };
                xhr.onerror = () => reject('Error');
                xhr.send();
            }
        );
    }

    static getUser(username) {
        const url = 'https://api.github.com/users/' + username;
        return GithubApiClient.getResponse(url);
    }

    static getUserRepos(username) {
        const url = 'https://api.github.com/users/' + username + '/repos';
        return GithubApiClient.getResponse(url);
    }

    static getRepoContributors(username, repo) {
        const url = 'https://api.github.com/repos/' + username + '/' + repo + '/contributors';
        return GithubApiClient.getResponse(url);
    }

}

