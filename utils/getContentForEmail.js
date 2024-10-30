module.exports = (name, img, prize) => {
  const contentMail = `
  <html>
    <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif !important;">
      <h3>Cher(e) ${name}</h3>
      <p style="margin-top: 15px">Nous avons le plaisir de vous annoncer que vous avez participé avec succès à notre jeu et, réussie à gagner ${prize}.</p>
      <p style="margin-top: 15px">Ce cadeau est notre façon de vous féliciter et de vous remercier pour votre participation. Nous espérons que vous profiterez pleinement de cette opportunité et nous avons hâte de vous revoir dans notre boutique.</p>
      <p style="margin-top: 15px">Encore félicitations et merci de faire partie de notre communauté !</p>
      <p style="margin-top: 20px">Cordialement,</p>
      <p style="margin-top: 15px">Équipe Marketing d'Europ'Alu</p>
      <table
        width="100%"
        style="margin-top: 30px; margin-bottom: 20px; padding: 0 20px"
      >
        <tr>
          <td align="center">
            <img src="https://3d.europ-alu.com${img}" width="400px"/>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  return contentMail;
};
