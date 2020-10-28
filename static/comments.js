let username = user.username
let usertype = user.usertype

const textarea = document.querySelector('#review-textarea')
const submitbtn = document.querySelector('#submitbtn')
const comment_box = document.querySelector('.all_comments')

submitbtn.addEventListener('click',(e) => {
    e.preventDefault()
    let comment= textarea.value 

    if(!comment){
        return
    }
    postComment(comment)
})

function postComment(comment){
    //append to dom
    let data ={
        username: username,
        usertype: usertype,
        comment: comment
    }
    appendToDom(data)
    textarea.value=''
}

function appendToDom(data){
    let lTag= document.createElement('li')
    lTag.classList.add('comment')
    
    let markup = `

         <div class="cards">
         <div class="cards-body">
         <div class="user-image"></div>

         <div class="user-details">
         if ${data.usertype} == "developer"
           <p style="color:white;display:inline;">${data.username}</p>
           <p style="display:inline;color:green;"><strong>&lt;dev&gt;</strong></p>
         else
           <p>${data.username}</p>
         <hr>
         <div class="user-comments"><p style="color:white;">${data.comment}</p></div>
         <div class="comment-buttons" style="text-align:right;">
         <button class="reply" ><i class="fas fa-reply"></i><b><i>reply</i></b></button>
         <input type="radio" style="display:none;" id="like">
         <label for="like" ><i  style="color:white;"class="far fa-thumbs-up"></i></label>&nbsp;
         <input type="radio" style="display:none;" id="dislike">
         <label for="dislike"><i class="far fa-thumbs-down"></i></i></label>
         </div>
         </div>

         </div>
         </div>
    `
    lTag.innerHTML = markup
    comment_box.prepend(lTag)
}
