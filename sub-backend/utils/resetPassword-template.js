export default (data) => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 0; background-color: #f4f7fa;">
      <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        <tr>
          <td style="background-color: #4a90e2; text-align: center;">
            <p style="font-size: 54px; line-height: 54px; font-weight: 800; color: #ffffff; margin: 0; padding: 20px;">SubDub</p>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 30px;">
            <p style="font-size: 16px; margin-bottom: 25px;">Hello,</p>
            <p style="font-size: 16px; margin-bottom: 25px;">You recently requested to reset the password for your account. Please click the button below to complete the process:</p>

            <table cellpadding="0" cellspacing="0" border="0" style="width: 100%; text-align: center; margin-top: 20px; margin-bottom: 25px;">
              <tr>
                <td>
                  <a href="${data.resetPasswordLink}" style="background-color: #4a90e2; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 5px; font-size: 16px; font-weight: bold; display: inline-block;">Reset My Password</a>
                </td>
              </tr>
            </table>

            <p style="font-size: 16px; margin-bottom: 25px;">This link will expire in one hour for security reasons. If you did not request a password reset, please ignore this email.</p>
            
            <p style="font-size: 16px; margin-top: 30px;">
              Best regards,<br>
              <strong>The SubDub Team</strong>
            </p>
          </td>
        </tr>
        <tr>
          <td style="background-color: #f0f7ff; padding: 20px; text-align: center; font-size: 14px;">
            <p style="margin: 0 0 10px;">
              SubDub Inc. | 123 Main St, Anytown, AN 12345
            </p>
            <p style="margin: 0;">
              <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Unsubscribe</a> | 
              <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Privacy Policy</a> | 
              <a href="#" style="color: #4a90e2; text-decoration: none; margin: 0 10px;">Terms of Service</a>
            </p>
          </td>
        </tr>
      </table>
    </div>
  `;
};
