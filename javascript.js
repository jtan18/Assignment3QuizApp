var username = "",
    tol_questions = "",
    msg = "";
var tol_quest = 0,
    qno = 0,
    time = 0,
    score = 0,
    ans = "";
var component = "";
var done = false;

var dash_template = Handlebars.compile("<div id=board class=f-box-h><div class=show>Welcome {{username}}</div><div class=show>Score : {{score}}</div> <div class=show>Answered : {{qno}}/{{tol_quest}} </div><div class=show>Time : {{m}} min {{s}} s</div></div>");
var question_template = Handlebars.compile("<div class=quest> Q{{q}}. {{quest}} </div>");
var msg_correct_temp = Handlebars.compile("<div id=correct class=correct> {{wow}}!! It's Correct </div>");
var msg_wrong_temp = Handlebars.compile("<div id=wrong class=wrong>Wrong. <div class=explain>{{explain}}</div><button type=button class=btn-primary onclick=update_question()>Next Question</button></div>");
var result_temp = Handlebars.compile("<div class=f-box-v><h3>Your Score is : {{score}}</h3><h2>{{txt}}</h2></div>");

const wrong = () => {
    return msg_wrong_temp({ explain: msg });
};

const make_option = (id, opt) => {
    let s = "<div class=opt><input type=radio id=" + id + " name=choice " + "value=" + opt + "><label id=" + ("l" + id) + " for=" + opt + "> " + opt + " </label><br></div>";
    return s;
}

const correct = () => {
    let ww = ["Good work", "Nice!", "Awesome"];
    let i = (Math.random() * 100) % ww.length;
    return msg_correct_temp({ wow: ww[Math.floor(i)] });
}

document.querySelector("#get_uname").addEventListener("click", (e) => {
    username = document.getElementById("uname").value.trim();
    if (username == "") {
        alert("Username is required to give quize.")
    } else {
        document.getElementById("login").style.display = "none";
        update_dashboard();
        update_question();
        setInterval(() => {
            time += 1;
            update_dashboard();
        }, 1000);
    }
});

document.querySelector("#submit").addEventListener("click", (e) => {
    if (done) return;
    done = true;
    let choices = document.getElementsByName("choice");
    for (let i = 0; i < choices.length; i++) {
        if (choices[i].checked) {
            let attempt = document.getElementById("l" + choices[i].id).innerText;
            if (attempt == ans) {
                score += 1;
                document.getElementById("remark").innerHTML = correct();
                setTimeout(() => {
                    update_question();
                }, 1000);
                return;
            }
        }
    }
    document.getElementById("remark").innerHTML = wrong();
});

const update_dashboard = () => {
    document.getElementById("dash").innerHTML = dash_template({ username: username, score: score, qno: qno, tol_quest: tol_quest, m: Math.round(time / 60), s: time % 60 });
}

const update_question = async() => {
    component = "";
    document.getElementById("remark").innerHTML = "";
    done = false;
    qno += 1;
    if (qno > tol_quest) {
        console.log("PEr ", score / tol_quest);
        let mm = ((score / tol_quest) > 0.8) ? "Congrats " : "Sorry ";
        document.getElementById("root").innerHTML = result_temp({ score: score, txt: mm + username });
        document.getElementById("submit").style.display = "none";
        return;
    }
    var api = "https://my-json-server.typicode.com/jtan18/Assignment3QuizApp/questions/" + qno;
    fetch(api)
        .then(res => {
            res.json().then(data => {
                component += question_template({ q: qno, quest: data.question });
                let options = "";
                for (let i = 0; i < data.options.length; i++) {
                    options += make_option(i, data.options[i]);
                }
                component += "<div id=choice_box class=options>" + options + "</div>";
                document.getElementById("root").innerHTML = component;
                msg = data.Explanation;
                ans = data.answer;
            })
        })
        .catch(err => {
            alert("Unable to fetch data from " + api);
        })

    document.getElementById("submit").style.display = "flex";
};

const init = async() => {
    fetch("https://my-json-server.typicode.com/jtan18/Assignment3QuizApp/quiz/")
        .then(res => {
            res.json().then(data => {
                tol_quest = data.total_questions;
            })
        })
        .catch(err => {
            console.log(err);
        })
};
init();