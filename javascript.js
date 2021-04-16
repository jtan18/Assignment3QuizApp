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
var endpoint = 1;

var dash_template = Handlebars.compile("<div id=board class=f-box-h><div class=show>Welcome {{username}}</div><div class=show>Score : {{score}}</div> <div class=show>Answered : {{qno}}/{{tol_quest}} </div><div class=show>Time : {{m}} min {{s}} s</div></div>");
var question_template = Handlebars.compile("<div class=quest> Q{{q}}. {{quest}} </div>");
var msg_correct_temp = Handlebars.compile("<div id=correct class=correct> {{wow}}! Correct. </div>");
var msg_wrong_temp = Handlebars.compile("<div id=wrong class=wrong>Incorrect. <div class=explain>{{explain}}</div><button type=button class=btn-primary onclick=update_question()>Next Question</button></div>");
var result_temp = Handlebars.compile("<div class=f-box-v><h3>Your Score is : {{score}}</h3><h2>{{txt}}</h2><br><button id=res-btn type=button class=btn-primary onclick=reset()>Start again</button></div>");

const reset = () => {
    console.log("Reseting");
    score = 0;
    qno = 0;
    time = 0;
    update_question();
};

const wrong = () => {
    return msg_wrong_temp({ explain: msg });
};

const make_option = (id, opt) => {
    let s = "<div class=opt><input type=radio id=" + id + " name=choice " + "value=" + opt + "><label id=" + ("l" + id) + " for=" + opt + "> " + opt + " </label><br></div>";
    return s;
}

const correct = () => {
    let ww = ["Great Work", "Nice", "Awesome"];
    let i = (Math.random() * 100) % ww.length;
    return msg_correct_temp({ wow: ww[Math.floor(i)] });
}

const select = (endpoint_) => {
    username = document.getElementById("uname").value.trim();
    console.log("endpoint_ : ", endpoint_);
    endpoint = endpoint_;
    if (username == "") {
        alert("A username is required to give quiz.")
    } else {
        document.getElementById("login").style.display = "none";
        update_dashboard();
        update_question();
        setInterval(() => {
            time += 1;
            update_dashboard();
        }, 1000);
    }
};

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
    document.getElementById("dash").innerHTML = dash_template({ username: username, score: score, qno: qno - 1, tol_quest: tol_quest, m: Math.round(time / 60), s: time % 60 });
}

const update_question = async() => {
    component = "";
    document.getElementById("remark").innerHTML = "";
    document.getElementById("submit").style.display = "none";
    qno += 1;
    if (qno > tol_quest) {
        let mm = ((score / tol_quest) > 0.8) ? "Congrats " : "Sorry ";
        document.getElementById("root").innerHTML = result_temp({ score: score, txt: mm + username });
        document.getElementById("submit").style.display = "none";
        if (score / tol_quest > 0.8)
            document.getElementById("res-btn").style.display = "none";
        return;
    }
    var api;
    if (endpoint == 1)
        api = "https://my-json-server.typicode.com/jtan18/Assignment3QuizApp/questions/" + qno;
    else
        api = "https://my-json-server.typicode.com/jtan18/jtan18.github.io/questions/" + qno;

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
                done = false;
                document.getElementById("submit").style.display = "flex";
            })
        })
        .catch(err => {
            alert("Unable to fetch data from " + api);
        })

};

const init = async() => {
    fetch("https://my-json-server.typicode.com/jtan18/Assignment3QuizApp/quiz")
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