document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-send').addEventListener('click', function(event) {
    send_email();
    event.preventDefault();
  });

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Fetch that mail
  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
      // Print emails
      console.log(emails);
      emails.forEach(element => {
        const mail = document.createElement('div');
        mail.addEventListener('click', function() {
          single_email(element.id)
        });

        // Add a touch of class
        mail.className = 'email';
        if (element.read === true) {
          mail.classList.add('read');
        };

        // Catch empty subject lines
        subject = element.subject == "" ? '(No subject)' : element.subject

        mail.innerHTML = `<span class="subject">${subject}</span>
                          <span class="sender">${element.sender}</span>
                          <span class="timestamp">${element.timestamp}</span>
                        `;
        document.querySelector('#emails-view').append(mail)
      });
  });
}

function send_email() {

  recipients = document.querySelector('#compose-recipients').value;
  subject = document.querySelector('#compose-subject').value;
  body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients, 
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
  });

  // Go to 'sent' to see your freshly baked email
  load_mailbox('sent');
}

function single_email(id) {

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-view').style.display = 'block';

  fetch('/emails/' + id)
  .then(response => response.json())
  .then(email => {
      // Print email
      console.log(email);

      document.querySelector('#single-subject').innerHTML = email.subject
      document.querySelector('#single-sender').innerHTML = email.sender
      document.querySelector('#single-timestamp').innerHTML = email.timestamp
      document.querySelector('#single-body').innerHTML = email.body

      // Determine archive button behaviour
      const archive_button = document.querySelector('#single-archive') 
      if (document.querySelector("#current_user").innerHTML === email.sender) {
        archive_button.style.display = 'none';
      } else if (email.archived === true){  
        archive_button.value = 'Unarchive';
        archive_button.addEventListener('click', () => archive_email(email.id, false));
      } else {
        archive_button.value = 'Archive';
        archive_button.addEventListener('click', () => archive_email(email.id, true));
      }

      fetch('/emails/' + id, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })

      document.querySelector('#single-markread').addEventListener('click', () => mark_read(email, true));
      document.querySelector('#single-markunread').addEventListener('click', () => mark_read(email, false));

      // Determine read button behaviour
      if (document.querySelector("#current_user").innerHTML === email.sender) {
        document.querySelector('#single-markread').style.display = 'none';
        document.querySelector('#single-markunread').style.display = 'none';
      } else {
        setreadbutton(email)
      }
      
  });

}

function archive_email(id, status) {
  fetch('/emails/' + id, {
    method: 'PUT',
    body: JSON.stringify({
      archived: status
    })
  })
  load_mailbox('inbox');
}

function mark_read(email, status) {
  fetch('/emails/' + email.id, {
    method: 'PUT',
    body: JSON.stringify({
      read: status
    })
  })
  console.log('set read status to ' + status);
  setreadbutton(email)
}

function setreadbutton(email) {
  if (email.read === true){  
    document.querySelector('#single-markread').style.display = 'none';
    document.querySelector('#single-markunread').style.display = 'inlline-block';
    console.log('I hid the MarkRead')
  } else {
    document.querySelector('#single-markread').style.display = 'inlline-block';
    document.querySelector('#single-markunread').style.display = 'none';
    console.log('I hid the MarkUnread TEEHEE')
  }
}

