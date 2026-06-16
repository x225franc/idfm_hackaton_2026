function EmailTemplate({ url, text1, text2, link, logo, mail }) {
    // Variables de couleurs calquées sur ton main.css (Dark Mode)
    const bgBody = "#0b0d10";         // Fond de l'email (--bg-base)
    const bgCard = "#13171c";         // Fond de la carte centrale (--bg-surface)
    const textColor = "#f8fafc";      // Texte principal (--text-main)
    const mutedColor = "#94a3b8";     // Texte secondaire (--text-muted)
    const primaryColor = "#0050AA";   // bleu comutitres_hackaton pour les boutons
    const borderColor = "#2a2f3a";    // Bordure subtile (--border-subtle)

    let formattedLink = "";
    if (link) {
        formattedLink = link.replace(
            /<a /g,
            `<a style="background-color: ${primaryColor}; color: #ffffff; display: inline-block; padding: 14px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; letter-spacing: 0.5px;" `
        );
    }

    return `
        <!DOCTYPE html>
        <html lang="fr">
            <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>comutitres_hackaton</title>
                <style>
                    /* Styles critiques pour forcer les clients mail à bien afficher le HTML */
                    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
                    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
                    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
                    
                    /* Reset */
                    body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${bgBody}; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
                </style>
            </head>
            <body style="background-color: ${bgBody}; margin: 0 !important; padding: 0 !important;">

                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: ${bgBody}; padding: 40px 0;">
                    <tr>
                        <td align="center" style="padding: 0 15px;">
                            
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto;">
                                
                                <tr>
                                    <td align="center" style="padding-bottom: 30px;">
                                        <a href="${url}" target="_blank" style="text-decoration: none;">
                                            <img src="${logo}" alt="comutitres_hackaton Logo" width="150" style="display: block; width: 150px; max-width: 150px;padding: 10px;" />
                                        </a>
                                    </td>
                                </tr>

                                <tr>
                                    <td bgcolor="${bgCard}" style="padding: 45px 35px; border-radius: 16px; border: 1px solid ${borderColor}; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            
                                            ${text1 ? `
                                            <tr>
                                                <td style="color: ${textColor}; font-size: 16px; line-height: 26px; padding-bottom: 20px;">
                                                    ${text1}
                                                </td>
                                            </tr>
                                            ` : ""}
                                            
                                            ${text2 ? `
                                            <tr>
                                                <td style="color: ${mutedColor}; font-size: 15px; line-height: 24px; padding-bottom: 35px;">
                                                    ${text2}
                                                </td>
                                            </tr>
                                            ` : ""}

                                            ${formattedLink ? `
                                            <tr>
                                                <td align="center" style="padding-bottom: 40px; padding-top: 10px;">
                                                    ${formattedLink}
                                                </td>
                                            </tr>
                                            ` : ""}

                                            <tr>
                                                <td style="border-top: 1px solid ${borderColor}; padding-top: 25px;">
                                                    <p style="color: ${textColor}; font-size: 15px; font-weight: bold; margin: 0 0 6px 0;">L'équipe comutitres_hackaton</p>
                                                    <p style="color: ${mutedColor}; font-size: 14px; margin: 0;">Besoin d'aide ? <a href="mailto:${mail}" style="color: ${primaryColor}; text-decoration: none; font-weight: bold;">Contactez-nous</a>.</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>

                                <tr>
                                    <td align="center" style="padding-top: 25px;">
                                        <p style="color: #64748b; font-size: 12px; margin: 0; line-height: 1.6;">
                                            Cet e-mail a été envoyé automatiquement, merci de ne pas y répondre.
                                        </p>
                                        <p style="color: #64748b; font-size: 12px; margin: 8px 0 0 0;">
                                            &copy; ${new Date().getFullYear()} comutitres_hackaton. Tous droits réservés.
                                        </p>
                                    </td>
                                </tr>

                            </table>
                        </td>
                    </tr>
                </table>

            </body>
        </html>
    `;
}

module.exports = EmailTemplate;