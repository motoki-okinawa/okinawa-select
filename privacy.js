const email=window.SITE_CONFIG?.contactEmail||'';
const contactUrl=window.SITE_CONFIG?.contactUrl||'';
const contact=document.getElementById('contact');
if(contact&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
  const link=document.createElement('a');
  link.href=`mailto:${email}`;
  link.textContent=email;
  contact.replaceChildren(link);
}else if(contact&&/^https:\/\//.test(contactUrl)){
  const link=document.createElement('a');
  link.href=contactUrl;
  link.textContent='お問い合わせフォームを開く';
  link.target='_blank';
  link.rel='noopener noreferrer';
  contact.replaceChildren(link);
}
