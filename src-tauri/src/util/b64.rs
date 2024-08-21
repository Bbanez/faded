use base64::prelude::*;

pub fn encode(s: &str) -> String {
    BASE64_STANDARD.encode(s)
}

pub fn decode(s: &str) -> String {
    String::from_utf8(BASE64_STANDARD.decode(s).unwrap()).unwrap()
}
