module.exports = (name, img, prize) => {
  const contentMail = `
  <html>
    <body style="margin: 0; padding: 0; font-family: 'Lato', sans-serif !important;">
      <h3>Cher(e) ${name}</h3>
      <p style="margin-top: 15px">Nous avons le plaisir de vous annoncer que vous faites partie de nos heureux gagnants ! Grâce à votre participation à notre jeu, vous avez remporté ${prize} 🎁.</p>
      <p style="margin-top: 15px">C’est notre façon de vous remercier et de vous féliciter pour votre engagement. Nous espérons que cette remise vous permettra de profiter encore plus de nos produits et services. Au plaisir de vous accueillir prochainement en boutique et de partager de nouvelles opportunités avec vous.</p>
      <p style="margin-top: 15px">Merci d'être un membre précieux de notre communauté ! 🙏</p>
      <p style="margin-top: 15px">Vous pouvez récupérer votre lot directement au showroom Europ'Alu à Ankorandrano, ou du 18 au 31 novembre au stand Europ'Alu à Carrefour Ankorandrano.</p>
      <p style="margin-top: 15px">⚠️ Important : les lots sont valables uniquement jusqu'au 31 novembre 2024 ! N'attendez pas pour venir les chercher ! 🎁</p>
      <p style="margin-top: 20px">Cordialement,</p>
      <p style="margin-top: 15px">Équipe Marketing d'Europ'Alu</p>
      <table
        width="100%"
        style="margin-top: 30px; margin-bottom: 20px; padding: 0 20px"
      >
        <tr>
          <td align="center">
            <img src="https://3d.europ-alu.com${img}" width="300px"/>
          </td>
        </tr>
      </table>
    </body>
  </html>`;

  return contentMail;
};
