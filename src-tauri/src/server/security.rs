use actix_web::HttpRequest;
use serde::Serialize;

#[derive(Serialize, Debug)]
pub struct SecurityError {
    pub message: String
}

pub fn validate(req: &HttpRequest) -> Result<(), String> {
    let headers = req.headers();
    let nonce_opt = headers.get("x-faded-nonce");
    match nonce_opt {
        Some(nonce) => {
            Ok(())
        }
        None => {
            let err = SecurityError {
                message: "Missing header nonce".to_string()
            };
            Err(serde_json::to_string(&err).unwrap())
        }
    }
}