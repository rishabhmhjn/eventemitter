// Sample for handling the rendering
//
// var emitter = new EventEmitter();
//
// function loadRepos(user){
//   emitter.emit('data.repos', repos);
//   repos.forEach(function(repo){
//     loadBranches(repo);
//     loadCollaborators(repo);
//   });
//   emitter.on('data.branches.*', renderBranches);
//   emitter.on('data.collaborators.*', renderCollaborators);
// }
//
// function loadBranches(repo){
//   emitter.emit('data.branches.jquery', branches);
// }
//
// function loadCollaborators(repo){
//   emitter.emit('data.collaborators.jquery', collaborators);
// }
//
// // render repositories data
// function renderBranches(data, type){ }
//
// // render branches data
// function renderBranches(data, type){ }
//
// // render collaborators data
// function renderCollaborators(data, type){ }


(function(window) {

  var GH_URLS = {
    listRepos: 'https://api.github.com/users/{USER}/repos?callback=?',
    listCollabs: 'https://api.github.com/repos/{USER}/{REPO}/collaborators?callback=?',
    listBranches: 'https://api.github.com/repos/{USER}/{REPO}/branches?callback=?'
  };

  var $tbody = $('#table-gh-userinfo tbody');

  var ghAlert = (function() {
    var $alert = $('#gh-alert');

    return function(text) {
      if (text) {
        $alert.text(text).show();
      } else {
        $alert.hide();;
      }
    };
  }())

  var emitter = new EventEmitter();

  function loadRepos(user) {
    var url = GH_URLS.listRepos.replace('{USER}', user);
    $.getJSON(url)
      .done(function(result) {
        var repos = result.data;
        if (!Array.isArray(repos)) {
          ghAlert(repos.message);
          return;
        }
        emitter.emit('data.repos', repos);
        repos.forEach(function(repo) {
          loadBranches(repo);
          loadCollaborators(repo);
        });

      });
  }

  function loadBranches(repo) {
    var url = GH_URLS.listBranches.replace('{USER}', repo.owner.login).replace('{REPO}', repo.name);
    // console.log(url);
    $.getJSON(url)
      .done(function(result) {
        var branches = result.data;
        if (!Array.isArray(branches)) {
          ghAlert(branches.message);
          return;
        }
        emitter.emit('data.branches.jquery', repo, branches);
      });
  }

  function loadCollaborators(repo) {
    var url = GH_URLS.listCollabs.replace('{USER}', repo.owner.login).replace('{REPO}', repo.name);
    // console.log(url);
    $.getJSON(url)
      .done(function(result) {
        var collaborators = result.data;
        if (!Array.isArray(collaborators)) {
          ghAlert(collaborators.message);
          return;
        }
        emitter.emit('data.collaborators.jquery', repo, collaborators);
      });
  }

  // render repositories data
  function renderRepos(event, repos) {
    $tbody.empty();

    repos.forEach(function(repo) {
      var $td1 = $('<td>')
        .addClass('gh-td-project')
        .append(
          $('<a>')
          .attr({
            href: repo.html_url,
            target: '_blank'
          })
          .text(repo.name)
      )
        .append('<br>')
        .append('<span></span>');

      var $tr = $('<tr>').attr('id', 'tr-repo-' + repo.name).addClass('gh-repo-row');

      $tr.append($td1)
        .append($('<td>').addClass('gh-td-collab'))
        .append($('<td>').addClass('gh-td-updated').text(new Date(repo.updated_at).toLocaleString()));

      $tbody.append($tr);

    });
  }
  // render repositories data
  function renderBranches(event, repo, branches) {
    // console.log(arguments);
    var branchNames = branches.map(function(branch) {
      return branch.name;
    });

    var $branchSpan = $('#tr-repo-' + repo.name + ' td.gh-td-project span', $tbody);
    $branchSpan.text('(' + branchNames.join(', ') + ')');
  }

  // render collaborators data
  function renderCollaborators(event, repo, collabs) {
    // console.log(arguments);
    var collabHTMLs = collabs.map(function(collab) {
      var $collab = $('<a>').attr({
        href: collab.html_url,
        target: '_blank'
      }).text(collab.login);
      return $collab.get(0).outerHTML;
    });

    var $collabSpan = $('#tr-repo-' + repo.name + ' td.gh-td-collab', $tbody);
    $collabSpan.html(collabHTMLs.join(', '));
  }


  emitter.on('data.repos', renderRepos);
  emitter.on('data.branches.*', renderBranches);
  emitter.on('data.collaborators.*', renderCollaborators);

  $('#gh-form').submit(function(event) {
    ghAlert();
    loadRepos($('#input-gh-username').val());
    event.preventDefault();
  });



})(window);
