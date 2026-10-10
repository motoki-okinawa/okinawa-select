const email=window.SITE_CONFIG?.contactEmail||'';
const contact=document.getElementById('contact');
if(contact&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
  const link=document.createElement('a');
  link.href=`mailto:${email}`;
  link.textContent=email;
  contact.replaceChildren(link);
}
